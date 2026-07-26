// Function to Auto Fetch and Render Leads on Dashboard Table
async function fetchAndRenderLeads() {
    try {
        const response = await fetch('/api/leads/all');
        const result = await response.json();

        if (!result.success) {
            console.error('Failed to fetch leads:', result.message);
            return;
        }

        const leadsTableBody = document.getElementById('leadsTableBody');
        if (!leadsTableBody) return;

        leadsTableBody.innerHTML = '';

        result.data.forEach(lead => {
            // Source Badge Styling
            let sourceBadgeClass = 'bg-info text-dark';
            if (lead.source === 'DSA Agent') sourceBadgeClass = 'bg-warning text-dark';
            if (lead.source === 'Customer (Online)') sourceBadgeClass = 'bg-primary';

            // User Info who created
            const creatorName = lead.createdBy ? lead.createdBy.name : 'Guest Customer';
            const creatorRole = lead.createdBy ? `(${lead.createdBy.role})` : '';

            const row = `
                <tr>
                    <td><strong>${lead.applicantName}</strong><br><small class="text-muted">${lead.phone}</small></td>
                    <td>${lead.loanProduct}</td>
                    <td>₹${lead.requestedAmount.toLocaleString('en-IN')}</td>
                    <td>
                        <span class="badge ${sourceBadgeClass}">${lead.source}</span>
                    </td>
                    <td>
                        <small><strong>${creatorName}</strong> ${creatorRole}</small><br>
                        <small class="text-muted">DSA Code: ${lead.dsaCode}</small>
                    </td>
                    <td>
                        <span class="badge bg-${lead.camCalculated.status === 'Eligible' ? 'success' : 'danger'}">
                            ${lead.camCalculated.status}
                        </span>
                    </td>
                    <td>${new Date(lead.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
            `;
            leadsTableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error in fetching leads:', error);
    }
}

// Auto Fetch On Page Load
document.addEventListener('DOMContentLoaded', fetchAndRenderLeads);