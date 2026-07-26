// =========================================================
// 1. LEAD MANAGEMENT ENGINE (Fetch + Create)
// =========================================================

// Fetch & Render All Leads
async function fetchAndRenderLeads() {
    try {
        const response = await fetch('/api/leads/all');
        const result = await response.json();

        if (!result.success) return;

        const leads = result.data || [];

        // Update Dashboard Cards
        let dsaCount = 0, onlineCount = 0, eligibleCount = 0;
        leads.forEach(lead => {
            if (lead.source === 'DSA Agent') dsaCount++;
            if (lead.source === 'Customer (Online)') onlineCount++;
            if (lead.camCalculated && lead.camCalculated.status === 'Eligible') eligibleCount++;
        });

        if (document.getElementById('totalLeadsCount')) document.getElementById('totalLeadsCount').innerText = leads.length;
        if (document.getElementById('dsaLeadsCount')) document.getElementById('dsaLeadsCount').innerText = dsaCount;
        if (document.getElementById('onlineLeadsCount')) document.getElementById('onlineLeadsCount').innerText = onlineCount;
        if (document.getElementById('eligibleLeadsCount')) document.getElementById('eligibleLeadsCount').innerText = eligibleCount;

        const leadsTableBody = document.getElementById('leadsTableBody');
        if (!leadsTableBody) return;

        if (leads.length === 0) {
            leadsTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No leads available yet.</td></tr>`;
            return;
        }

        leadsTableBody.innerHTML = '';
        leads.forEach(lead => {
            let sourceBadgeClass = 'bg-info text-dark';
            if (lead.source === 'DSA Agent') sourceBadgeClass = 'bg-warning text-dark';
            if (lead.source === 'Customer (Online)') sourceBadgeClass = 'bg-primary text-white';

            const creatorName = lead.createdBy ? lead.createdBy.name : 'Direct Online User';

            const row = `
                <tr>
                    <td><strong>${lead.applicantName || 'N/A'}</strong><br><small class="text-muted">📞 ${lead.phone || ''}</small></td>
                    <td><span class="badge bg-light text-dark border">${lead.loanProduct || 'Personal Loan'}</span></td>
                    <td><strong>₹${(lead.requestedAmount || 0).toLocaleString('en-IN')}</strong></td>
                    <td><span class="badge ${sourceBadgeClass} px-2 py-1">${lead.source || 'Customer (Online)'}</span></td>
                    <td><small><strong>${creatorName}</strong></small><br><small class="text-muted">DSA Code: <code>${lead.dsaCode || 'DIRECT'}</code></small></td>
                    <td><span class="badge bg-${(lead.camCalculated && lead.camCalculated.status === 'Eligible') ? 'success' : 'danger'}">${lead.camCalculated ? lead.camCalculated.status : 'Pending'}</span></td>
                    <td><small class="text-muted">${new Date(lead.createdAt).toLocaleDateString('en-IN')}</small></td>
                </tr>
            `;
            leadsTableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error rendering leads:', error);
    }
}

// Submit New Lead Form to Backend
document.addEventListener('DOMContentLoaded', () => {
    const addLeadForm = document.getElementById('addLeadForm');
    if (addLeadForm) {
        addLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const leadData = {
                applicantName: document.getElementById('leadApplicantName').value,
                phone: document.getElementById('leadPhone').value,
                city: document.getElementById('leadCity').value,
                loanProduct: document.getElementById('leadLoanProduct').value,
                requestedAmount: document.getElementById('leadRequestedAmount').value,
                monthlyIncome: document.getElementById('leadMonthlyIncome').value,
                existingEmi: document.getElementById('leadExistingEmi').value,
                bouncingCount: document.getElementById('leadBouncingCount').value,
                dsaCode: document.getElementById('leadDsaCode').value || 'DIRECT',
                userRole: 'ADMIN' // Default submission role
            };

            try {
                const response = await fetch('/api/leads/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Lead Created & Evaluated Successfully!');
                    addLeadForm.reset();
                    
                    // Close Bootstrap Modal if present
                    const modalElement = document.getElementById('addLeadModal');
                    if (modalElement && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                    }

                    fetchAndRenderLeads(); // Auto Refresh Data
                } else {
                    alert('Error saving lead: ' + result.message);
                }
            } catch (error) {
                console.error('Error saving lead:', error);
                alert('Server Error: Could not save lead.');
            }
        });
    }
});


// =========================================================
// 2. BANK CONFIG ENGINE (Fetch + Create)
// =========================================================

// Fetch & Render Banks
async function fetchAndRenderBanks() {
    try {
        const response = await fetch('/api/banks/all');
        const result = await response.json();

        if (!result.success) return;

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
                    <td><span class="badge ${bank.isActive ? 'bg-success' : 'bg-danger'}">${bank.isActive ? 'Active' : 'Inactive'}</span></td>
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

// Toggle Status
async function toggleBankStatus(bankId) {
    try {
        const response = await fetch(`/api/banks/toggle-status/${bankId}`, { method: 'PATCH' });
        const result = await response.json();
        if (result.success) fetchAndRenderBanks();
    } catch (error) {
        console.error('Error toggling status:', error);
    }
}

// Submit New Bank Form
document.addEventListener('DOMContentLoaded', () => {
    const addBankForm = document.getElementById('addBankForm');
    if (addBankForm) {
        addBankForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const bankData = {
                bankName: document.getElementById('bankName').value,
                code: document.getElementById('bankCode').value,
                minSalary: document.getElementById('bankMinSalary').value,
                foirPercent: document.getElementById('bankFoirPercent').value,
                minCibil: document.getElementById('bankMinCibil').value,
                payoutPercentage: document.getElementById('bankPayoutPercent').value,
                isActive: true
            };

            try {
                const response = await fetch('/api/banks/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bankData)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Bank Saved Successfully!');
                    addBankForm.reset();

                    const modalElement = document.getElementById('addBankModal');
                    if (modalElement && window.bootstrap) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                    }

                    fetchAndRenderBanks();
                } else {
                    alert('Error saving bank: ' + result.message);
                }
            } catch (error) {
                console.error('Error saving bank:', error);
                alert('Server Error: Could not save bank.');
            }
        });
    }
});

// Auto Load Data on Page Load
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderLeads();
    fetchAndRenderBanks();
});