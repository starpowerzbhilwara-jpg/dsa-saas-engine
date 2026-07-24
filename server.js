require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');

const connectDB = require('./config/db');
const User = require('./models/User');
const Application = require('./models/Application');
const BankConfig = require('./models/BankConfig');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Connect DB & Middlewares
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: "Access Denied!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid Session!" });
        req.user = decoded;
        next();
    });
};

// ==================== AUTH ROUTES & UTM AUTO-LOGIN ====================

// Register Staff / Agent
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, password, role, phone, location } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const utmTag = username.toLowerCase().replace(/\s+/g, '_');

        const newUser = new User({
            name, username, password: hashedPassword,
            role: role || 'DSA_AGENT',
            phone, location: location || 'All',
            utmLink: `${req.protocol}://${req.get('host')}/?utm_agent=${utmTag}`
        });

        await newUser.save();
        res.json({ success: true, message: "User Registered Successfully!", user: newUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login (Standard & Auto UTM Login Support)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid Credentials!" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username, location: user.location },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, role: user.role, location: user.location, utmLink: user.utmLink }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== EXCEL DRAG & DROP UPLOAD ====================

app.post('/api/applications/upload-excel', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Please upload an Excel file!" });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const leads = rows.map(row => ({
            clientName: row['Client Name'] || row['Name'] || 'Unknown Client',
            clientPhone: row['Phone'] || row['Mobile'] || '0000000000',
            location: row['Location'] || req.user.location || 'General',
            bankName: row['Bank'] || 'Pending Allocation',
            loanAmount: row['Loan Amount'] || row['Amount'] || 0,
            createdById: req.user.id,
            status: 'Logged In'
        }));

        await Application.insertMany(leads);
        res.json({ success: true, message: `${leads.length} Leads imported successfully!` });
    } catch (err) {
        res.status(500).json({ success: false, message: "Excel processing error: " + err.message });
    }
});

// ==================== BANK LOCKER & SM DIRECTORY APIs ====================

// Add/Update Bank Details & SM Contacts (Admin Only)
app.post('/api/bank-config', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'MASTER') {
            return res.status(403).json({ success: false, message: "Only Admin can manage Bank Logins!" });
        }
        const { bankName, portalUrl, loginId, password, salesManagers } = req.body;
        
        let config = await BankConfig.findOne({ bankName });
        if (config) {
            config.portalUrl = portalUrl;
            config.loginId = loginId;
            config.password = password;
            config.salesManagers = salesManagers;
            await config.save();
        } else {
            config = new BankConfig({ bankName, portalUrl, loginId, password, salesManagers });
            await config.save();
        }

        res.json({ success: true, message: "Bank Locker Details Saved!", data: config });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Fetch Bank Logins & Location SMs (Filtered for Staff)
app.get('/api/bank-config', verifyToken, async (req, res) => {
    try {
        const configs = await BankConfig.find();
        
        // Filter SM details by Staff User's Location
        const formattedData = configs.map(bank => {
            const localSM = bank.salesManagers.filter(
                sm => sm.location.toLowerCase() === req.user.location.toLowerCase() || sm.location === 'All'
            );
            return {
                _id: bank._id,
                bankName: bank.bankName,
                portalUrl: bank.portalUrl,
                loginId: bank.loginId,
                password: bank.password,
                assignedSMs: localSM.length > 0 ? localSM : bank.salesManagers
            };
        });

        res.json({ success: true, banks: formattedData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== DASHBOARD & STATUS UPDATE WITH PAYOUTS ====================

// Update Lead Status & Calculate Commission
app.put('/api/applications/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, masterPayout, agentPayout, callerPayout } = req.body;
        const appData = await Application.findById(req.params.id);

        if (!appData) return res.status(404).json({ success: false, message: "Lead not found!" });

        appData.status = status;
        if (status === 'Disbursed') {
            appData.payouts = {
                masterPayout: Number(masterPayout) || 0,
                agentPayout: Number(agentPayout) || 0,
                callerPayout: Number(callerPayout) || 0
            };
        }

        await appData.save();
        res.json({ success: true, message: `Status updated to ${status}!`, data: appData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Main Dashboard Data Router
app.get('/api/dashboard', verifyToken, async (req, res) => {
    try {
        const { id, role, location } = req.user;
        let query = {};

        if (role === 'CALLING_STAFF') {
            query = { $or: [{ assignedTo: id }, { location: location }] };
        } else if (role === 'DSA_AGENT') {
            query = { createdById: id };
        }

        const files = await Application.find(query).sort({ createdAt: -1 });

        let totalEarnings = 0;
        files.forEach(f => {
            if (f.status === 'Disbursed') {
                if (role === 'MASTER') totalEarnings += (f.payouts?.masterPayout || 0);
                else if (role === 'DSA_AGENT') totalEarnings += (f.payouts?.agentPayout || 0);
                else if (role === 'CALLING_STAFF') totalEarnings += (f.payouts?.callerPayout || 0);
            }
        });

        res.json({
            success: true,
            role,
            files,
            analytics: {
                totalFiles: files.length,
                disbursedFiles: files.filter(f => f.status === 'Disbursed').length,
                totalEarnings
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Advanced DSA Engine Running on http://localhost:${PORT}`));