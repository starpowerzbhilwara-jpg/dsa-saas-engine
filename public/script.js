// Global User Session State
let currentUser = JSON.parse(localStorage.getItem('dsa_user')) || {
    _id: null,
    name: 'Guest',
    role: 'CUSTOMER',
    dsaCode: 'DIRECT'
};

// 1. Render Dashboard Based On User Role
function initializePortalView() {
    const roleBadge = document.getElementById('userRoleBadge');
    if (roleBadge) roleBadge.innerText = `${currentUser.name} (${currentUser.role})`;

    // Fetch Leads according to login role
    fetchAndRenderRoleLeads();
}

// 2. Fetch Leads Specific to User Role
async function fetchAndRenderRoleLeads() {
    try {
        const url = `/api/leads/my-leads?role=${currentUser.role}&dsaCode=${currentUser.dsaCode}&userId=${currentUser._id}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) return;

        const leadsTableBody = document.getElementById('leadsTableBody');
        if (!leadsTableBody) return;

        leadsTableBody.innerHTML = '';

        result.data.forEach(lead => {
            // Render UTM Links
            let utmButtons = '';
            if (lead.eligibleBankIds && lead.eligibleBankIds.length > 0) {
                lead.eligibleBankIds.forEach(bank => {
                    utmButtons += `
                        <a href="${bank.utmLink}" target="_blank" class="btn btn-sm btn-outline-primary mb-1 me-1">
                            Apply ${bank.bankName} ↗
                        </a>
                    `;
                });
            } else {
                utmButtons = '<span class="text-muted small">No Active UTM</span>';
            }

            const row = `
                <tr>
                    <td><strong>${lead.applicantName}</strong><br><small class="text-muted">📞 ${lead.phone}</small></td>
                    <td>${lead.loanProduct}</td>
                    <td>₹${(lead.requestedAmount || 0).toLocaleString('en-IN')}</td>
                    <td><span class="badge bg-info">${lead.source}</span></td>
                    <td><code>${lead.dsaCode}</code></td>
                    <td>${utmButtons}</td>
                    <td><span class="badge bg-${lead.camCalculated.status === 'Eligible' ? 'success' : 'danger'}">${lead.camCalculated.status}</span></td>
                </tr>
            `;
            leadsTableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error loading role leads:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializePortalView);