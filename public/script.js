document.addEventListener('DOMContentLoaded', () => {

    // Helper: Form Object Exporter
    function getFormPayload(formElement) {
        const payload = {};
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                payload[key] = input.value;
            }
        });
        return payload;
    }

    // ----------------------------------------------------
    // 1. FILE LOGIN WITH DOCUMENTS ENGINE
    // ----------------------------------------------------
    const fileLoginForm = document.getElementById('fileLoginForm');
    if (fileLoginForm) {
        fileLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('applicantName', document.getElementById('flName')?.value || '');
            formData.append('phone', document.getElementById('flPhone')?.value || '');
            formData.append('city', document.getElementById('flCity')?.value || '');
            formData.append('loanProduct', document.getElementById('flProduct')?.value || '');
            formData.append('monthlyIncome', document.getElementById('flIncome')?.value || 0);
            formData.append('existingEmi', document.getElementById('flEmi')?.value || 0);
            formData.append('bouncingCount', document.getElementById('flBounce')?.value || 0);
            formData.append('requestedAmount', document.getElementById('flReqAmt')?.value || 0);

            const pan = document.getElementById('panCardFile')?.files[0];
            const aadhaar = document.getElementById('aadhaarCardFile')?.files[0];
            const stmt = document.getElementById('bankStatementFile')?.files[0];
            const slip = document.getElementById('salarySlipFile')?.files[0];

            if (pan) formData.append('panCard', pan);
            if (aadhaar) formData.append('aadhaarCard', aadhaar);
            if (stmt) formData.append('bankStatement', stmt);
            if (slip) formData.append('salarySlip', slip);

            try {
                const res = await fetch('/api/leads/file-login', {
                    method: 'POST',
                    body: formData
                });
                const result = await res.json();
                if (res.ok && result.status === 'success') {
                    alert('File Uploaded & Processed Successfully!');
                    renderCAMAndUnlockedBanks(result.data || result);
                } else {
                    alert('Upload Failed: ' + (result.message || 'Error occurred'));
                }
            } catch (err) {
                console.error("Upload Error:", err);
                alert('Server Error during file upload.');
            }
        });
    }

    // ----------------------------------------------------
    // 2. BANK LINKS & CREDENTIALS ADD FORM
    // ----------------------------------------------------
    const addBankForm = document.getElementById('addBankForm') || document.querySelector('form[action*="bank"]');
    if (addBankForm) {
        addBankForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = getFormPayload(addBankForm);

            try {
                const res = await fetch('/api/banks/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Bank Entry Added Successfully!');
                    addBankForm.reset();
                    if (typeof loadBanks === 'function') loadBanks();
                } else {
                    alert('Error: ' + (result.message || 'Failed to add Bank'));
                }
            } catch (err) {
                console.error("Bank Save Error:", err);
                alert('Server Error during saving Bank details.');
            }
        });
    }

    // ----------------------------------------------------
    // 3. CALLING DATA & LEADS FORM
    // ----------------------------------------------------
    const addLeadForm = document.getElementById('addLeadForm') || document.querySelector('form[action*="lead"]');
    if (addLeadForm) {
        addLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = getFormPayload(addLeadForm);

            try {
                const res = await fetch('/api/leads/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Lead Entry Saved Successfully!');
                    addLeadForm.reset();
                    if (typeof loadLeads === 'function') loadLeads();
                } else {
                    alert('Error: ' + (result.message || 'Failed to save Lead'));
                }
            } catch (err) {
                console.error("Lead Save Error:", err);
                alert('Server Error while saving Lead.');
            }
        });
    }

    // ----------------------------------------------------
    // 4. DSA / AGENT NETWORK FORM
    // ----------------------------------------------------
    const addAgentForm = document.getElementById('addAgentForm') || document.getElementById('addUserForm');
    if (addAgentForm) {
        addAgentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = getFormPayload(addAgentForm);

            try {
                const res = await fetch('/api/users/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Agent/DSA Registered Successfully!');
                    addAgentForm.reset();
                    if (typeof loadAgents === 'function') loadAgents();
                } else {
                    alert('Error: ' + (result.message || 'Failed to register Agent'));
                }
            } catch (err) {
                console.error("Agent Save Error:", err);
                alert('Server Error while adding Agent.');
            }
        });
    }

    // ----------------------------------------------------
    // 5. SALES MANAGER (SINGLE & BULK EXCEL)
    // ----------------------------------------------------
    const singleSmForm = document.getElementById('addSmForm');
    if (singleSmForm) {
        singleSmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputs = singleSmForm.querySelectorAll('input, select');
            const payload = {
                state: inputs[0]?.value || '',
                city: inputs[1]?.value || '',
                smName: inputs[2]?.value || '',
                mobile: inputs[3]?.value || '',
                loanProduct: inputs[4]?.value || 'HL'
            };

            try {
                const res = await fetch('/api/sm/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Sales Manager Added Successfully!');
                    singleSmForm.reset();
                } else {
                    alert('Failed: ' + (result.message || 'Error occurred'));
                }
            } catch (err) {
                console.error("SM Save Error:", err);
                alert('Server Error while saving Sales Manager.');
            }
        });
    }

    // ----------------------------------------------------
    // 6. BANK PAYOUTS FORM
    // ----------------------------------------------------
    const addPayoutForm = document.getElementById('addPayoutForm');
    if (addPayoutForm) {
        addPayoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                agentName: document.getElementById('payAgentName')?.value || '',
                agentEmail: document.getElementById('payAgentEmail')?.value || '',
                applicantName: document.getElementById('payApplicant')?.value || '',
                bankName: document.getElementById('payBank')?.value || '',
                loanProduct: document.getElementById('payProduct')?.value || '',
                disbursedAmount: Number(document.getElementById('payAmount')?.value || 0),
                payoutRate: Number(document.getElementById('payRate')?.value || 0)
            };

            try {
                const res = await fetch('/api/payouts/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (res.ok) {
                    alert('Disbursed Case Saved & Payout Invoice Generated!');
                    addPayoutForm.reset();
                    loadPayouts();
                } else {
                    alert('Error: ' + (result.message || 'Failed to save payout'));
                }
            } catch (err) {
                console.error("Payout Error:", err);
                alert('Server Error during saving payout.');
            }
        });
    }

    // Load initial data
    loadPayouts();
});

// Helper Functions
async function loadPayouts() {
    const tbody = document.getElementById('payoutTableBody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/payouts/all');
        const result = await res.json();
        tbody.innerHTML = '';
        const list = result.data || result || [];

        list.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${item.invoiceNumber || 'INV-000'}</strong></td>
                    <td>${item.agentName || 'N/A'}<br><small class="text-muted">${item.agentEmail || ''}</small></td>
                    <td>${item.applicantName || 'N/A'}<br><small class="text-muted">${item.bankName || ''}</small></td>
                    <td><span class="badge bg-primary">${item.loanProduct || 'N/A'}</span></td>
                    <td>₹${(item.disbursedAmount || 0).toLocaleString()}</td>
                    <td>${item.payoutRate || 0}%</td>
                    <td class="fw-bold text-success">₹${(item.netPayoutAmount || 0).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-dark" onclick="viewInvoice('${item._id}')">
                            <i class="bi bi-file-earmark-pdf"></i> Invoice
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Load Payouts Error:", err);
    }
}