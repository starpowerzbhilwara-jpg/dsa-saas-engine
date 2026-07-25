document.addEventListener('DOMContentLoaded', () => {
    console.log("Portal Control Panel Initialized...");

    // 1. Auto Find SM & Policy Button Handler
    const autoFindBtn = document.querySelector('button[class*="Auto Find"]');
    if (autoFindBtn) {
        autoFindBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const inputs = document.querySelectorAll('.card-body input, input[placeholder*="Bank"]');
            const bank = inputs[0]?.value || '';
            const state = inputs[1]?.value || '';
            const district = inputs[2]?.value || '';

            try {
                const res = await fetch(`/api/banks/search?bank=${bank}&state=${state}&district=${district}`);
                const data = await res.json();
                console.log("SM Lookup Results:", data);
                // Dynamically update UI if required
            } catch (err) {
                console.error("Search error:", err);
            }
        });
    }

    // 2. SM Master Excel Import Handler
    const smImportBtn = document.querySelector('button:has(.fa-file-excel), .btn-success');
    const smFileInput = document.querySelector('input[type="file"]');
    
    if (smImportBtn && smFileInput) {
        smImportBtn.addEventListener('click', async (e) => {
            if (!smFileInput.files[0]) return alert("Pehle Excel sheet select karein!");
            
            const formData = new FormData();
            formData.append('file', smFileInput.files[0]);

            try {
                const res = await fetch('/api/sm/upload-excel', { method: 'POST', body: formData });
                const data = await res.json();
                alert(data.message || "SM List imported successfully!");
            } catch (err) {
                alert("Upload failed: " + err.message);
            }
        });
    }

    // 3. Generic Form Submission Fallback (For Lead Add & Bank Adding)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const action = this.getAttribute('action') || '/api/applications/add';
            const formData = new FormData(this);

            try {
                const res = await fetch(action, { method: 'POST', body: formData });
                const data = await res.json();
                alert(data.message || 'Operation successful!');
                location.reload(); // Refresh table data
            } catch (err) {
                alert('Action failed: ' + err.message);
            }
        });
    });
});