// =========================================================
// 🚀 100% FULLY AUTOMATIC ENGINE (NO MANUAL HTML SETUP REQUIRED)
// =========================================================

// Automatic Module Detector (Auto Detects form context)
function detectModuleName(form) {
    // 1. Agar HTML me explicit data-module likha hai toh wo le
    if (form.getAttribute('data-module')) return form.getAttribute('data-module');
    
    // 2. Agar Form ki ID hai (e.g. 'dsaRegisterForm' -> 'dsa_register')
    if (form.id) return form.id.replace(/form/gi, '').toLowerCase();

    // 3. Page URL ke hisab se auto-detect kare (e.g. 'dsa-register.html' -> 'dsa_register')
    const path = window.location.pathname.split('/').pop().replace('.html', '');
    if (path && path !== '' && path !== 'index') return path;

    // 4. Default fallback module
    return 'lead';
}

// Automatic Form Interceptor (Saves ANY form without modifying HTML)
document.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;

    // Direct Form values extract karein
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
        if (value && value.trim() !== '') {
            payload[key] = value.trim();
        }
    });

    // Auto Detect Module Name
    const moduleName = detectModuleName(form);

    // UI Submit Button Auto-Loader
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('button');
    const originalBtnText = submitBtn ? submitBtn.innerText : 'Submitting...';
    if (submitBtn) submitBtn.innerText = 'Saving...';

    try {
        // Dynamic Universal Backend Route
        const response = await fetch(`/api/dynamic/save-data/${moduleName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('✅ Data Automatically Saved!');
            form.reset(); // Clear input boxes
            
            // Auto Table/Board Data Refresh
            loadDynamicTableData(moduleName);
        } else {
            alert('❌ Save Error: ' + (result.message || 'Error occurred'));
        }
    } catch (err) {
        console.error('Auto Save Engine Error:', err);
        alert('❌ Server Connection Error!');
    } finally {
        if (submitBtn) submitBtn.innerText = originalBtnText;
    }
});

// Universal Dynamic Table Loader
async function loadDynamicTableData(moduleName) {
    const tableBody = document.querySelector('tbody');
    if (!tableBody) return;

    if (!moduleName) {
        const dummyForm = document.querySelector('form');
        moduleName = dummyForm ? detectModuleName(dummyForm) : 'lead';
    }

    try {
        const res = await fetch(`/api/dynamic/get-data/${moduleName}`);
        const result = await res.json();

        if (result.success && result.data && result.data.length > 0) {
            tableBody.innerHTML = result.data.map((row, index) => {
                const keys = Object.keys(row).filter(k => k !== '_id' && k !== '__v');
                const cells = keys.slice(0, 5).map(key => `<td>${row[key] || '-'}</td>`).join('');
                return `<tr>
                    <td><b>#${index + 1}</b></td>
                    ${cells}
                </tr>`;
            }).join('');
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No records found.</td></tr>`;
        }
    } catch (err) {
        console.error('Auto Load Table Error:', err);
    }
}

// Page load hone par table auto refresh
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicTableData();
});