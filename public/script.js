// Global Helper Functions
function toggleView(elementId, callback) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.toggle('d-none');
        if (!el.classList.contains('d-none') && typeof callback === 'function') {
            callback();
        }
    }
}

// ----------------------------------------------------
// 1. FILE LOGIN WITH DOCUMENTS & UNLOCKED BANKS ENGINE
// ----------------------------------------------------
document.getElementById('fileLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('applicantName', document.getElementById('flName').value);
    formData.append('phone', document.getElementById('flPhone').value);
    formData.append('city', document.getElementById('flCity').value);
    formData.append('loanProduct', document.getElementById('flProduct').value);
    formData.append('monthlyIncome', document.getElementById('flIncome').value);
    formData.append('existingEmi', document.getElementById('flEmi').value);
    formData.append('bouncingCount', document.getElementById('flBounce').value);
    formData.append('requestedAmount', document.getElementById('flReqAmt').value);

    // Append Files
    const pan = document.getElementById('panCardFile').files[0];
    const aadhaar = document.getElementById('aadhaarCardFile').files[0];
    const stmt = document.getElementById('bankStatementFile').files[0];
    const slip = document.getElementById('salarySlipFile').files[0];

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
        if (result.status === 'success') {
            renderCAMAndUnlockedBanks(result.data);
        } else {
            alert('File Upload Failed: ' + result.message);
        }
    } catch (err) {
        console.error(err);
        alert('Server Error during file login upload.');
    }
});

async function renderCAMAndUnlockedBanks(leadData) {
    const section = document.getElementById('loggedFileDetails');
    const camBox = document.getElementById('camSummaryBanner');
    const bankList = document.getElementById('eligibleBanksList');

    section.classList.remove('d-none');
    
    const cam = leadData.camCalculated || {};

    if (cam.status === 'Eligible') {
        camBox.className = "alert alert-success border-success p-3 rounded shadow-sm";
        camBox.innerHTML = `
            <h5 class="fw-bold mb-1"><i class="bi bi-check-circle-fill"></i> File Approved by Auto-CAM Engine!</h5>
            <div><strong>Applicant:</strong> ${leadData.applicantName} | <strong>City:</strong> ${leadData.city} | <strong>Product:</strong> ${leadData.loanProduct}</div>
            <div class="fs-6 mt-1"><strong>Approved Loan Eligibility:</strong> ₹${(cam.approvedAmount || 0).toLocaleString()} | <strong>Max Allowed EMI:</strong> ₹${(cam.maxEmiAllowed || 0).toLocaleString()}</div>
        `;
    } else {
        camBox.className = "alert alert-danger border-danger p-3 rounded shadow-sm";
        camBox.innerHTML = `
            <h5 class="fw-bold mb-1"><i class="bi bi-x-circle-fill"></i> File Rejected by Auto-Engine</h5>
            <div><strong>Reason:</strong> ${cam.rejectionReason || 'Criteria Not Met'}</div>
        `;
    }

    // Display Unlocked Banks
    bankList.innerHTML = '';
    
    // Fetch Location SM Data for Matching City
    let smData = { data: [] };
    try {
        const smRes = await fetch('/api/sm/all');
        smData = await smRes.json();
    } catch (e) { console.log(e); }

    if (!leadData.eligibleBankIds || leadData.eligibleBankIds.length === 0) {
        bankList.innerHTML = `<div class="col-12 alert alert-warning">No bank logins unlocked for this criteria or product.</div>`;
        return;
    }

    leadData.eligibleBankIds.forEach(bank => {
        // Location Match SM
        const smMatch = (smData.data || []).find(sm => 
            sm.city.toLowerCase().includes((leadData.city || '').toLowerCase())
        );

        bankList.innerHTML += `
            <div class="col-md-6">
                <div class="card p-3 border-success shadow-sm h-100">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="fw-bold text-success mb-0"><i class="bi bi-shield-check"></i> ${bank.bankName}</h5>
                        <span class="badge bg-success">UNLOCKED</span>
                    </div>
                    <hr class="my-2">
                    <div class="small mb-2">
                        <div><strong>Portal / UTM Type:</strong> ${bank.portalType || 'UTM Link'}</div>
                        ${bank.userId ? `<div><strong>User ID:</strong> <code>${bank.userId}</code></div>` : ''}
                        ${bank.password ? `<div><strong>Password:</strong> <code>${bank.password}</code></div>` : ''}
                    </div>
                    
                    <div class="alert alert-info p-2 mb-2 small fw-bold">
                        📲 Need Login OTP? Contact Admin: ${bank.adminOtpPhone || '+91-9876543210'}
                    </div>

                    <div class="p-2 bg-light rounded border mb-3">
                        <small class="fw-bold text-secondary">Mapped Location Sales Manager (${leadData.city}):</small>
                        ${smMatch ? `
                            <div class="text-dark fw-bold">${smMatch.smName} (${smMatch.mobile})</div>
                            <small class="text-muted">${smMatch.city}, ${smMatch.state}</small>
                        ` : `
                            <div class="text-danger small">No SM mapped for ${leadData.city}.</div>
                        `}
                    </div>

                    <a href="${bank.portalUrl}" target="_blank" class="btn btn-success fw-bold w-100">
                        Launch ${bank.bankName} Portal / UTM
                    </a>
                </div>
            </div>
        `;
    });
}

// ----------------------------------------------------
// 2. BANK PAYOUTS & INVOICE GENERATOR SYSTEM
// ----------------------------------------------------
document.getElementById('addPayoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        agentName: document.getElementById('payAgentName').value,
        agentEmail: document.getElementById('payAgentEmail').value,
        applicantName: document.getElementById('payApplicant').value,
        bankName: document.getElementById('payBank').value,
        loanProduct: document.getElementById('payProduct').value,
        disbursedAmount: Number(document.getElementById('payAmount').value),
        payoutRate: Number(document.getElementById('payRate').value)
    };

    const res = await fetch('/api/payouts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.status === 'success') {
        alert('Disbursed Case Saved & Payout Invoice Generated!');
        document.getElementById('addPayoutForm').reset();
        loadPayouts();
    } else {
        alert('Error: ' + result.message);
    }
});

async function loadPayouts() {
    const res = await fetch('/api/payouts/all');
    const result = await res.json();
    const tbody = document.getElementById('payoutTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    (result.data || []).forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.invoiceNumber}</strong></td>
                <td>${item.agentName}<br><small class="text-muted">${item.agentEmail}</small></td>
                <td>${item.applicantName}<br><small class="text-muted">${item.bankName}</small></td>
                <td><span class="badge bg-primary">${item.loanProduct}</span></td>
                <td>₹${item.disbursedAmount.toLocaleString()}</td>
                <td>${item.payoutRate}%</td>
                <td class="fw-bold text-success">₹${item.netPayoutAmount.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-dark" onclick="viewInvoice('${item._id}')">
                        <i class="bi bi-file-earmark-pdf"></i> Invoice
                    </button>
                </td>
            </tr>
        `;
    });
}

async function viewInvoice(id) {
    const res = await fetch('/api/payouts/all');
    const result = await res.json();
    const item = (result.data || []).find(p => p._id === id);
    if (!item) return;

    const modalBody = document.getElementById('printableInvoice');
    modalBody.innerHTML = `
        <div class="border p-4 bg-white rounded">
            <div class="d-flex justify-content-between border-bottom pb-3 mb-3">
                <div>
                    <h4 class="fw-bold text-primary mb-0">DSA SAAS ENGINE</h4>
                    <small class="text-muted">Commission & Payout Disbursement Statement</small>
                </div>
                <div class="text-end">
                    <h5 class="fw-bold text-dark mb-0">INVOICE</h5>
                    <small class="text-muted">No: ${item.invoiceNumber}</small>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-6">
                    <strong class="text-secondary">PAID TO AGENT:</strong>
                    <div class="fw-bold fs-5">${item.agentName}</div>
                    <div>Email: ${item.agentEmail}</div>
                </div>
                <div class="col-6 text-end">
                    <strong class="text-secondary">DATE:</strong>
                    <div>${new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
            </div>

            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>Customer / Applicant</th>
                        <th>Bank / NBFC</th>
                        <th>Product</th>
                        <th>Disbursed Loan Amt</th>
                        <th>Commission Rate</th>
                        <th>Payout Earned</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${item.applicantName}</td>
                        <td>${item.bankName}</td>
                        <td>${item.loanProduct}</td>
                        <td>₹${item.disbursedAmount.toLocaleString()}</td>
                        <td>${item.payoutRate}%</td>
                        <td class="fw-bold text-success">₹${item.netPayoutAmount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <small class="text-muted">This is a system-generated invoice for DSA channel payouts.</small>
                <h4 class="fw-bold text-success mb-0">Total: ₹${item.netPayoutAmount.toLocaleString()}</h4>
            </div>
        </div>
    ];

    const bsModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
    bsModal.show();
}