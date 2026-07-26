// =========================================================
// 🚀 DSA SAAS ENGINE - FILE & LEAD AUTOMATION ENGINE
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Page load hone par saare forms detect karein
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            // UI Loading indicator
            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
            if (submitBtn) submitBtn.innerText = 'Saving Data & Files...';

            try {
                // Multi-part Form Data (Handles Text + PDF/Image Files)
                const formData = new FormData(form);

                // API Route Call
                const response = await fetch('/api/leads/add', {
                    method: 'POST',
                    body: formData // Sends both text fields & files directly
                });

                const result = await response.json();

                if (response.ok && (result.success || result._id)) {
                    alert('✅ File Login Data Successfully Saved!');
                    form.reset();
                    if (typeof loadBoardData === 'function') loadBoardData();
                } else {
                    alert('❌ Save Failed: ' + (result.message || 'Unknown Server Error'));
                }
            } catch (err) {
                console.error('Submission Error:', err);
                alert('❌ Server Connection Error! Check backend logs.');
            } finally {
                if (submitBtn) submitBtn.innerHTML = originalBtnText;
            }
        });
    });

    // Initial Load for Table/Board
    if (typeof loadBoardData === 'function') {
        loadBoardData();
    }
});