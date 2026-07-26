document.addEventListener('DOMContentLoaded', () => {
    // Application Load hote hi saara data load karein
    loadLeads();
    loadSM();
    loadBankConfigs();
    loadPayouts();
    loadUsersList();

    // 1. FILE LOGIN FORM SUBMIT
    const fileLoginForm = document.getElementById('fileLoginForm');
    if (fileLoginForm) {
        fileLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                dsaCode: document.getElementById('flDsaCode').value,
                fullName: document.getElementById('flName').value,
                phoneNumber: document.getElementById('flPhone').value,
                city: document.getElementById('flCity').value,
                product: document.getElementById('flProduct').value,
                monthlyIncome: document.getElementById('flIncome').value,
                emi: document.getElementById('flEmi').value,
                bounce: document.getElementById('flBounce').value,
                requestedAmount: document.getElementById('flReqAmt').value
            };

            try {
                const res = await fetch('/api/leads/file-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('File Login Submitted Successfully!');
                    fileLoginForm.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Server Connection Error!');
            }
        });
    }

    // 2. CALLING LEAD FORM SUBMIT
    const addLeadForm = document.getElementById('addLeadForm');
    if (addLeadForm) {
        addLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                fullName: document.getElementById('leadName').value,
                phoneNumber: document.getElementById('leadPhone').value,
                loanType: document.getElementById('leadType').value
            };

            try {
                const res = await fetch('/api/leads/file-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('Lead Added!');
                    addLeadForm.reset();
                    loadLeads();
                } else {
                    alert('Failed: ' + data.message);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // 3. SM ADD FORM SUBMIT
    const addSmForm = document.getElementById('addSmForm');
    if (addSmForm) {
        addSmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                state: document.getElementById('smState').value,
                city: document.getElementById('smCity').value,
                name: document.getElementById('smName').value,
                mobile: document.getElementById('smMobile').value,
                product: document.getElementById('smProduct').value
            };

            try {
                const res = await fetch('/api/sm/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('Sales Manager Added!');
                    addSmForm.reset();
                    loadSM();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // 4. BANK CONFIG SUBMIT
    const addBankConfigForm = document.getElementById('addBankConfigForm');
    if (addBankConfigForm) {
        addBankConfigForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                bankName: document.getElementById('bankName').value,
                portalUrl: document.getElementById('portalUrl').value,
                userId: document.getElementById('userId').value,
                bankPassword: document.getElementById('bankPassword').value
            };

            try {
                const res = await fetch('/api/applications/bank-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('Bank Credentials Saved!');
                    addBankConfigForm.reset();
                    loadBankConfigs();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // 5. PAYOUT SUBMIT
    const addPayoutForm = document.getElementById('addPayoutForm');
    if (addPayoutForm) {
        addPayoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                agentName: document.getElementById('payAgentName').value,
                agentCode: document.getElementById('payAgentCode').value,
                applicant: document.getElementById('payApplicant').value,
                bank: document.getElementById('payBank').value,
                product: document.getElementById('payProduct').value,
                amount: document.getElementById('payAmount').value,
                rate: document.getElementById('payRate').value
            };

            try {
                const res = await fetch('/api/payouts/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('Payout Record Saved!');
                    addPayoutForm.reset();
                    loadPayouts();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // 6. USER/DSA REGISTRATION
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('usrName').value,
                email: document.getElementById('usrEmail').value,
                pass: document.getElementById('usrPass').value,
                role: document.getElementById('usrRole').value
            };

            try {
                const res = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert('DSA Registered!');
                    addUserForm.reset();
                    loadUsersList();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
});

// FETCH AND RENDER FUNCTIONS
async function loadLeads() {
    try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        const tbody = document.getElementById('leadsTableBody');
        if (data.success && data.leads && data.leads.length > 0) {
            tbody.innerHTML = data.leads.map(lead => `
                <tr>
                    <td>${lead.fullName || lead.name || 'N/A'}</td>
                    <td>${lead.phoneNumber || lead.phone || 'N/A'}</td>
                    <td>${lead.loanType || lead.product || 'N/A'}</td>
                    <td>${new Date(lead.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadSM() {
    try {
        const res = await fetch('/api/sm');
        const data = await res.json();
        const tbody = document.getElementById('smTableBody');
        if (data.success && data.sms && data.sms.length > 0) {
            tbody.innerHTML = data.sms.map(sm => `
                <tr>
                    <td>${sm.state}</td>
                    <td>${sm.city}</td>
                    <td>${sm.name}</td>
                    <td>${sm.mobile}</td>
                    <td>${sm.product}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadBankConfigs() {
    try {
        const res = await fetch('/api/applications/bank-config');
        const data = await res.json();
        const tbody = document.getElementById('bankConfigTableBody');
        if (data.success && data.configs && data.configs.length > 0) {
            tbody.innerHTML = data.configs.map(cfg => `
                <tr>
                    <td>${cfg.bankName}</td>
                    <td><a href="${cfg.portalUrl}" target="_blank">${cfg.portalUrl}</a></td>
                    <td>${cfg.userId || 'N/A'}</td>
                    <td>${cfg.bankPassword || '***'}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadPayouts() {
    try {
        const res = await fetch('/api/payouts');
        const data = await res.json();
        const tbody = document.getElementById('payoutTableBody');
        if (data.success && data.payouts && data.payouts.length > 0) {
            tbody.innerHTML = data.payouts.map(p => `
                <tr>
                    <td>${p.agentCode} - ${p.agentName}</td>
                    <td>${p.applicant} (${p.bank})</td>
                    <td>${p.product}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.rate}%</td>
                    <td>₹${(p.amount * p.rate) / 100}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadUsersList() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const tbody = document.getElementById('usersListTableBody');
        if (data.success && data.users && data.users.length > 0) {
            tbody.innerHTML = data.users.map(u => `
                <tr>
                    <td><span class="badge bg-primary">${u.dsaCode || 'DSA' + u._id.slice(-4)}</span></td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}