// =========================================================
// 1. LEAD MANAGEMENT DASHBOARD ENGINE
// =========================================================

// Function to Auto Fetch and Render Leads on Dashboard Table
async function fetchAndRenderLeads() {
    try {
        const response = await fetch('/api/leads/all');
        const result = await response.json();

        if (!result.success) {
            console.error('Failed to fetch leads:', result.message);
            return;
        }

        const leads = result.data || [];

        // Calculate Counters for Dashboard Cards
        let dsaCount = 0;
        let onlineCount = 0;
        let eligibleCount = 0;

        leads.forEach(lead => {
            if (lead.source === 'DSA Agent') dsaCount++;
            if (lead.source === 'Customer (Online)') onlineCount++;
            if (lead.camCalculated && lead.camCalculated.status === 'Eligible') eligibleCount++;
        });

        // Safely update DOM Counter Elements if present
        if (document.getElementById('totalLeadsCount')) 
            document.getElementById('totalLeadsCount').innerText = leads.length;
        if (document.getElementById('dsaLeadsCount')) 
            document.getElementById('dsaLeadsCount').innerText = dsaCount;
        if (document.getElementById('onlineLeadsCount')) 
            document.getElementById('onlineLeadsCount').innerText = onlineCount;
        if (document.getElementById('eligibleLeadsCount')) 
            document.getElementById('eligibleLeadsCount').innerText = eligibleCount;

        // Render Table Data
        const leadsTableBody = document.getElementById('leadsTableBody');
        if (!leadsTableBody) return;

        if (leads.length === 0) {
            leadsTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No leads available yet.</td></tr>`;
            return;
        }

        leadsTableBody.innerHTML = '';

        leads.forEach(lead => {
            // Source Badge Styling
            let sourceBadgeClass = 'bg-info text-dark';
            if (lead.source === 'DSA Agent') sourceBadgeClass = 'bg-warning text-dark';
            if (lead.source === 'Customer (Online)') sourceBadgeClass = 'bg-primary text-white';
            if (lead.source === 'Admin / Staff') sourceBadgeClass = 'bg-secondary text-white';

            // User Info who created
            const creatorName = lead.createdBy ? lead.createdBy.name : 'Direct Online User';
            const creatorRole = lead.createdBy ? `(${lead.createdBy.role})` : '';

            const row = `
                <tr>
                    <td>
                        <strong>${lead.applicantName || 'N/A'}</strong><br>
                        <small class="text-muted">📞 ${lead.phone || ''}</small>
                    </td>
                    <td><span class="badge bg-light text-dark border">${lead.loanProduct || 'Personal Loan'}</span></td>
                    <td><strong>₹${(lead.requestedAmount || 0).toLocaleString('en-IN')}</strong></td>
                    <td>
                        <span class="badge ${sourceBadgeClass} px-2 py-1">${lead.source || 'Customer (Online)'}</span>
                    </td>
                    <td>
                        <small><strong>${creatorName}</strong> ${creatorRole}</small><br>
                        <small class="text-muted">DSA Code: <code>${lead.dsaCode || 'DIRECT'}</code></small>
                    </td>
                    <td>
                        <span class="badge bg-${(lead.camCalculated && lead.camCalculated.status === 'Eligible') ? 'success' : 'danger'}">
                            ${lead.camCalculated ? lead.camCalculated.status : 'Pending'}
                        </span>
                    </td>
                    <td><small class="text-muted">${new Date(lead.createdAt).toLocaleDateString('en-IN')}</small></td>
                </tr>
            `;
            leadsTableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error rendering dashboard leads:', error);
    }
}


// =========================================================
// 2. BANK CONFIGURATION ENGINE
// =========================================================

// Fetch & Render Bank Configurations Table
async function fetchAndRenderBanks() {
    try {
        const response = await fetch('/api/banks/all');
        const result = await response.json();

        if (!result.success) {
            console.error('Failed to fetch banks:', result.message);
            return;
        }

        const bankTableBody = document.getElementById('bankTableBody');
        if (!bankTableBody) return;

        if (result.data.length === 0) {
            bankTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No Bank Configurations added yet.</td></tr>`;
            return;
        }

        bankTableBody.innerHTML = '';

        result.data.forEach(bank => {
            const row = `
                <tr>
                    <td><strong>${bank.bankName}</strong> <br><small class="text-muted">Code: ${bank.code || 'N/A'}</small></td>
                    <td>₹${(bank.minSalary || 0).toLocaleString('en-IN')}</td>
                    <td>${bank.foirPercent}%</td>
                    <td>${bank.minCibil}+</td>
                    <td>${bank.payoutPercentage}%</td>
                    <td>
                        <span class="badge ${bank.isActive ? 'bg-success' : 'bg-danger'}">
                            ${bank.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-warning me-1" onclick="toggleBankStatus('${bank._id}')">
                            ${bank.isActive ? 'Disable' : 'Enable'}
                        </button>
                    </td>
                </tr>
            `;
            bankTableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error fetching banks:', error);
    }
}

// Toggle Bank Status (Active/Inactive)
async function toggleBankStatus(bankId) {
    try {
        const response = await fetch(`/api/banks/toggle-status/${bankId}`, { method: 'PATCH' });
        const result = await response.json();
        if (result.success) {
            fetchAndRenderBanks(); // Refresh bank list dynamically
        } else {
            alert('Error updating bank status: ' + result.message);
        }
    } catch (error) {
        console.error('Error toggling bank status:', error);
    }
}


// =========================================================
// 3. INITIALIZATION ON PAGE LOAD
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Auto Load Leads Data
    fetchAndRenderLeads();
    
    // Auto Load Banks Data
    fetchAndRenderBanks();
});