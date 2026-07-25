document.addEventListener('DOMContentLoaded', () => {
    loadLeads();
    loadSMs();

    // 1. Add Lead API Call
    document.getElementById('addLeadForm').addEventListener('submit', async (e) => {
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
        alert(data.message || 'Lead Added!');
        document.getElementById('addLeadForm').reset();
        loadLeads();
    });

    // 2. Add SM API Call
    document.getElementById('addSmForm').addEventListener('submit', async (e) => {
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
        alert(data.message || 'SM Entry Added!');
        document.getElementById('addSmForm').reset();
        loadSMs();
    });
});

// Fetch & Show Calling Leads
async function loadLeads() {
    const res = await fetch('/api/applications/all');
    const data = await res.json();
    const list = document.getElementById('leadList');
    list.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            list.innerHTML += `<li class="list-group-item d-flex justify-content-between">
                <span><strong>${item.fullName}</strong> (${item.phone})</span>
                <span class="badge bg-info text-dark">${item.loanType}</span>
            </li>`;
        });
    }
}

// Fetch & Show SM Directory
async function loadSMs() {
    const res = await fetch('/api/sm/all');
    const data = await res.json();
    const list = document.getElementById('smList');
    list.innerHTML = '';
    if (data.data) {
        data.data.forEach(item => {
            list.innerHTML += `<li class="list-group-item d-flex justify-content-between">
                <span><strong>${item.smName}</strong> - ${item.city}, ${item.state} (${item.mobile})</span>
                <span class="badge bg-secondary">${item.product}</span>
            </li>`;
        });
    }
}