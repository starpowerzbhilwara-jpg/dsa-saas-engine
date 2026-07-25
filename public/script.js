document.addEventListener('DOMContentLoaded', () => {
    // 1. Add Single Lead
    document.getElementById('addLeadForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            fullName: document.getElementById('leadName').value,
            phone: document.getElementById('leadPhone').value,
            loanType: document.getElementById('leadType').value
        };
        const res = await fetch('/api/applications/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || 'Lead Saved!');
        document.getElementById('addLeadForm').reset();
    });

    // 2. Add SM Entry
    document.getElementById('addSmForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            state: document.getElementById('smState').value,
            city: document.getElementById('smCity').value,
            smName: document.getElementById('smName').value,
            mobile: document.getElementById('smMobile').value,
            product: document.getElementById('smProduct').value
        };
        const res = await fetch('/api/sm/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || 'SM Saved!');
        document.getElementById('addSmForm').reset();
    });

    // 3. Add Bank Config / UTM Link
    document.getElementById('addBankConfigForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            bankName: document.getElementById('bankName').value,
            portalUrl: document.getElementById('portalUrl').value,
            userId: document.getElementById('userId').value,
            password: document.getElementById('bankPassword').value
        };
        const res = await fetch('/api/banks/add-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || 'Bank Link Saved!');
        document.getElementById('addBankConfigForm').reset();
    });
});

// Toggle Show/Hide Functionality
function toggleView(elementId, fetchFunction) {
    const el = document.getElementById(elementId);
    if (el.classList.contains('d-none')) {
        el.classList.remove('d-none');
        if (fetchFunction) fetchFunction();
    } else {
        el.classList.add('d-none');
    }
}

// Load SMs Table
async function loadSMs() {
    const res = await fetch('/api/sm/all');
    const data = await res.json();
    const tbody = document.getElementById('smTableBody');
    tbody.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            tbody.innerHTML += `<tr>
                <td class="fw-bold">${item.smName || 'N/A'}</td>
                <td>${item.state || ''}, ${item.city || ''}</td>
                <td>${item.mobile || ''}</td>
                <td><span class="badge bg-secondary">${item.product || 'All'}</span></td>
            </tr>`;
        });
    }
}

// Load Leads Table
async function loadLeads() {
    const res = await fetch('/api/applications/all');
    const data = await res.json();
    const tbody = document.getElementById('leadTableBody');
    tbody.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            tbody.innerHTML += `<tr>
                <td class="fw-bold">${item.fullName}</td>
                <td>${item.phone}</td>
                <td>${item.loanType}</td>
                <td><span class="badge bg-warning text-dark">${item.status || 'Pending'}</span></td>
            </tr>`;
        });
    }
}

// Load Bank Configs
async function loadBankConfigs() {
    const res = await fetch('/api/banks/all-configs');
    const data = await res.json();
    const tbody = document.getElementById('bankTableBody');
    tbody.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            tbody.innerHTML += `<tr>
                <td class="fw-bold">${item.bankName}</td>
                <td><a href="${item.portalUrl}" target="_blank" class="btn btn-sm btn-link">${item.portalUrl}</a></td>
                <td><code>${item.userId || 'N/A'}</code></td>
                <td><code>${item.password || 'N/A'}</code></td>
            </tr>`;
        });
    }
}
// Add Payout Submit Event
document.getElementById('addPayoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        agentName: document.getElementById('payAgentName').value,
        agentEmail: document.getElementById('payAgentEmail').value,
        applicantName: document.getElementById('payApplicant').value,
        bankName: document.getElementById('payBank').value,
        productType: document.getElementById('payProduct').value,
        loanAmount: document.getElementById('payAmount').value,
        payoutPercentage: document.getElementById('payRate').value
    };

    const res = await fetch('/api/payouts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    alert(data.message || 'Payout Saved!');
    document.getElementById('addPayoutForm').reset();
    if (typeof loadPayouts === 'function') loadPayouts();
});

// Load Payout Ledger & Invoices
async function loadPayouts() {
    const res = await fetch('/api/payouts/all');
    const data = await res.json();
    const tbody = document.getElementById('payoutTableBody');
    tbody.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            tbody.innerHTML += `<tr>
                <td><code>${item.invoiceNumber}</code></td>
                <td><strong>${item.agentName}</strong><br><small class="text-muted">${item.agentEmail}</small></td>
                <td>${item.applicantName} <br><span class="badge bg-secondary">${item.bankName}</span></td>
                <td><span class="badge bg-info text-dark">${item.productType}</span></td>
                <td>₹${Number(item.loanAmount).toLocaleString()}</td>
                <td>${item.payoutPercentage}%</td>
                <td class="text-success fw-bold">₹${Number(item.payoutAmount).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick='viewInvoice(${JSON.stringify(item)})'>
                        <i class="bi bi-receipt"></i> Invoice
                    </button>
                </td>
            </tr>`;
        });
    }
}

// Generate & View Invoice Popup
function viewInvoice(data) {
    const container = document.getElementById('printableInvoice');
    container.innerHTML = `
        <div class="border p-4 rounded bg-white">
            <div class="d-flex justify-content-between border-bottom pb-3">
                <div>
                    <h4 class="fw-bold text-primary mb-0">DSA SaaS Engine</h4>
                    <small class="text-muted">Commission & Disbursed Payout Statement</small>
                </div>
                <div class="text-end">
                    <h6 class="fw-bold mb-0">${data.invoiceNumber}</h6>
                    <small>Date: ${new Date(data.createdAt).toLocaleDateString()}</small>
                </div>
            </div>

            <div class="row my-3">
                <div class="col-6">
                    <p class="mb-1"><strong>Agent / DSA Details:</strong></p>
                    <h6>${data.agentName}</h6>
                    <p class="text-muted mb-0">${data.agentEmail}</p>
                </div>
                <div class="col-6 text-end">
                    <p class="mb-1"><strong>Status:</strong></p>
                    <span class="badge bg-success">${data.status}</span>
                </div>
            </div>

            <table class="table table-bordered my-3">
                <thead class="table-light">
                    <tr>
                        <th>Customer</th>
                        <th>Bank</th>
                        <th>Product</th>
                        <th>Disbursed Amount</th>
                        <th>Payout Rate</th>
                        <th>Payout Earned</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${data.applicantName}</td>
                        <td>${data.bankName}</td>
                        <td>${data.productType}</td>
                        <td>₹${Number(data.loanAmount).toLocaleString()}</td>
                        <td>${data.payoutPercentage}%</td>
                        <td class="fw-bold text-success">₹${Number(data.payoutAmount).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div class="d-flex justify-content-between align-middle pt-3 border-top">
                <span class="fw-bold fs-5">Total Commission Payable:</span>
                <span class="fw-bold fs-4 text-success">₹${Number(data.payoutAmount).toLocaleString()}</span>
            </div>
        </div>
    `;
    const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
    invoiceModal.show();
}