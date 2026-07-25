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