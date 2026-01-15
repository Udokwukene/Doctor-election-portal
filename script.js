// ============================================
// MEDICAL ELECTION PORTAL - WITH COPY & TOGGLE FEATURES
// ============================================

// Application State
let voters = JSON.parse(localStorage.getItem('voters')) || [];
let adminLoggedIn = false;
let currentVoterId = ''; // Store the current voter ID for copy/toggle
let voterIdVisible = false; // Track if voter ID is visible

// Generate unique voter ID
function generateVoterId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `VTR${timestamp}${random}`;
}

// Mask voter ID for display
function maskVoterId(voterId) {
    if (!voterId || voterId.length <= 10) return voterId || 'N/A';
    const start = voterId.substring(0, 6);
    const end = voterId.substring(voterId.length - 4);
    const middle = '•'.repeat(voterId.length - 10);
    return `${start}${middle}${end}`;
}

// Unmask voter ID (show full ID)
function unmaskVoterId(voterId) {
    return voterId;
}

// Copy voter ID to clipboard
function copyVoterId() {
    if (!currentVoterId) {
        alert('No voter ID available to copy');
        return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(currentVoterId).then(() => {
        // Show success message
        const copyBtn = document.querySelector('.copy-btn');
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.backgroundColor = '';
        }, 2000);
        
        console.log('Voter ID copied to clipboard:', currentVoterId);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy voter ID. Please copy it manually.');
    });
}

// Toggle voter ID visibility
function toggleVoterIdVisibility() {
    const voterIdElement = document.getElementById('displayVoterId');
    const toggleBtn = document.querySelector('.toggle-btn i');
    
    voterIdVisible = !voterIdVisible;
    
    if (voterIdVisible) {
        // Show full ID
        voterIdElement.textContent = unmaskVoterId(currentVoterId);
        toggleBtn.className = 'fas fa-eye-slash';
        toggleBtn.parentElement.title = 'Hide ID';
    } else {
        // Show masked ID
        voterIdElement.textContent = maskVoterId(currentVoterId);
        toggleBtn.className = 'fas fa-eye';
        toggleBtn.parentElement.title = 'Show ID';
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.nextElementSibling.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
        toggleBtn.parentElement.title = 'Hide Password';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
        toggleBtn.parentElement.title = 'Show Password';
    }
}

// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        activePage.style.display = 'block';
    }
    
    // Reset admin view if not logged in
    if (pageId === 'admin-page' && !adminLoggedIn) {
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
    }
    
    // Reset voter ID visibility when leaving success page
    if (pageId !== 'success-page') {
        voterIdVisible = false;
    }
}

// Form validation
function validateForm(formData) {
    const errors = [];
    
    // Check required fields
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.dob) errors.push("Date of birth is required");
    if (!formData.sex) errors.push("Sex is required");
    if (!formData.maritalStatus) errors.push("Marital status is required");
    if (!formData.lga.trim()) errors.push("LGA is required");
    if (!formData.doctorId.trim()) errors.push("Doctor's ID is required");
    
    // Check age (at least 23)
    if (formData.dob) {
        const dob = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 23) {
            errors.push("Doctor must be at least 23 years old");
        }
    }
    
    // Check for duplicate doctor ID
    if (formData.doctorId && voters.some(v => v.doctorId === formData.doctorId)) {
        errors.push("This Doctor ID is already registered");
    }
    
    return errors;
}

// Registration form handler
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Registration form submitted");
    
    // Collect form data
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        otherNames: document.getElementById('otherNames').value,
        dob: document.getElementById('dob').value,
        sex: document.getElementById('sex').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        lga: document.getElementById('lga').value,
        doctorId: document.getElementById('doctorId').value
    };
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        alert("Please fix the following errors:\n\n" + errors.join("\n"));
        return;
    }
    
    // Generate voter ID
    currentVoterId = generateVoterId();
    console.log("Generated Voter ID:", currentVoterId);
    
    // Create voter object
    const voter = {
        voterId: currentVoterId,
        ...formData,
        registrationDate: new Date().toISOString()
    };
    
    // Save to localStorage
    voters.push(voter);
    localStorage.setItem('voters', JSON.stringify(voters));
    
    // Display masked voter ID initially
    voterIdVisible = false;
    const maskedId = maskVoterId(currentVoterId);
    document.getElementById('displayVoterId').textContent = maskedId;
    console.log("Masked ID for display:", maskedId);
    
    // Reset toggle button to show eye icon
    const toggleBtn = document.querySelector('.toggle-btn i');
    if (toggleBtn) {
        toggleBtn.className = 'fas fa-eye';
        toggleBtn.parentElement.title = 'Show ID';
    }
    
    // Reset copy button
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.style.backgroundColor = '';
    }
    
    // Reset form
    this.reset();
    
    // Show success page
    showPage('success-page');
});

// Admin login handler
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple credentials check
    if (username === 'admin' && password === 'admin123') {
        adminLoggedIn = true;
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminDashboard();
        this.reset();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Load admin dashboard
function loadAdminDashboard() {
    // Update total voters count
    document.getElementById('totalVoters').textContent = voters.length;
    
    // Populate voters table
    const tbody = document.getElementById('votersTableBody');
    tbody.innerHTML = '';
    
    if (voters.length === 0) {
        const row = tbody.insertRow();
        row.innerHTML = '<td colspan="7" style="text-align: center; padding: 2rem;">No voters registered yet</td>';
        return;
    }
    
    voters.forEach(voter => {
        const row = tbody.insertRow();
        const fullName = `${voter.firstName} ${voter.lastName} ${voter.otherNames || ''}`.trim();
        const maskedVoterId = maskVoterId(voter.voterId);
        
        // Add copy button for each voter ID
        const voterIdCell = `
            <div class="table-voter-id">
                ${maskedVoterId}
                <button class="table-copy-btn" onclick="copyTableVoterId('${voter.voterId}')" title="Copy ID">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        row.innerHTML = `
            <td>${voterIdCell}</td>
            <td>${fullName}</td>
            <td>${voter.dob}</td>
            <td>${voter.sex}</td>
            <td>${voter.maritalStatus}</td>
            <td>${voter.lga}</td>
            <td>${voter.doctorId}</td>
        `;
    });
}

// Copy voter ID from admin table
function copyTableVoterId(voterId) {
    navigator.clipboard.writeText(voterId).then(() => {
        // Find and update the specific copy button
        const allCopyBtns = document.querySelectorAll('.table-copy-btn');
        allCopyBtns.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(voterId)) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.backgroundColor = '#27ae60';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = '';
                }, 2000);
            }
        });
        
        console.log('Table Voter ID copied:', voterId);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy voter ID.');
    });
}

// Admin logout
function logoutAdmin() {
    adminLoggedIn = false;
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

// Export voter data
function exportVoterData() {
    try {
        const dataStr = JSON.stringify(voters, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `voters_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export data.');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation links
    document.querySelectorAll('[onclick^="showPage"]').forEach(link => {
        link.onclick = function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showPage(pageName);
        };
    });
    
    // Set active nav link on page load
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize with landing page
    showPage('landing-page');
    
    console.log("Portal initialized. Total voters:", voters.length);
});

// Add password toggle for admin login
function setupPasswordToggle() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        // Create toggle button if it doesn't exist
        if (!passwordInput.nextElementSibling || !passwordInput.nextElementSibling.classList.contains('password-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.title = 'Show Password';
            toggleBtn.onclick = function() {
                togglePasswordVisibility('adminPassword');
            };
            
            // Wrap input and button in container
            const container = document.createElement('div');
            container.className = 'password-input-container';
            passwordInput.parentNode.insertBefore(container, passwordInput);
            container.appendChild(passwordInput);
            container.appendChild(toggleBtn);
        }
    }
}

// Call setup on page load
setTimeout(setupPasswordToggle, 100);