// Data Save Karne Ka Function
async function saveLeadData(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {};

    // Form ka saara data automatic JSON me convert hoga
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch('/api/leads/add', { // Aapke leadRoutes ka exact path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert('Data Saved Successfully!');
            form.reset();
            loadBoardData(); // Live Board ko refresh karein
        } else {
            alert('Error: ' + result.message);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        alert('Server communication error');
    }
}

// Board / Table me Data Auto Load Karne Ka Function
async function loadBoardData() {
    const tableBody = document.querySelector('#dsaTableBody') || document.querySelector('tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/leads/all');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            tableBody.innerHTML = result.data.map(item => `
                <tr>
                    <td><b>${item.dsaCode || 'DIRECT'}</b></td>
                    <td>${item.applicantName || item.name || 'N/A'}</td>
                    <td>${item.phone || item.email || 'N/A'}</td>
                    <td>${item.loanProduct || item.role || 'General'}</td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No Data Registered Yet</td></tr>`;
        }
    } catch (err) {
        console.error("Board Load Error:", err);
    }
}

// Page Load hone par Board Data automatically dikhe
document.addEventListener('DOMContentLoaded', loadBoardData);