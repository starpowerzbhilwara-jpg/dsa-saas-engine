require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected...");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log("⚠️ Admin user pehle se bana hua hai!");
            process.exit(0);
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create Admin User
        const adminUser = new User({
            name: "Super Admin",
            username: "admin",
            password: hashedPassword,
            role: "MASTER",
            phone: "9999999999"
        });

        await adminUser.save();
        console.log("✅ Super Admin User successfully ban gaya hai!");
        console.log("-------------------------------------------");
        console.log("🔑 Username: admin");
        console.log("🔑 Password: admin123");
        console.log("-------------------------------------------");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
};

createAdmin();