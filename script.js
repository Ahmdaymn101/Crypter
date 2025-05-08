
// DOM Elements
const authSection = document.getElementById('auth-section');
const encryptionSection = document.getElementById('encryption-section');
const welcomeMessage = document.getElementById('welcome-message');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordModal = document.getElementById('change-password-modal');
const closeChangePassword = document.getElementById('close-change-password');
const cancelChangePassword = document.getElementById('cancel-change-password');
const toast = document.getElementById('toast');
const passwordToggles = document.querySelectorAll('.toggle-password');
const toastMessage = document.getElementById('toast-message');
const closeToast = document.getElementById('close-toast');

// Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const changePasswordForm = document.getElementById('change-password-form');

// Encryption elements
const aesEncryptBtn = document.getElementById('aes-encrypt-btn');
const aesDecryptBtn = document.getElementById('aes-decrypt-btn');
const aesText = document.getElementById('aes-text');
const aesResult = document.getElementById('aes-result');
const aesKey = document.getElementById('aes-key');
const aesResultContainer = document.getElementById('aes-result-container');
const aesKeyContainer = document.getElementById('aes-key-container');

const rsaEncryptBtn = document.getElementById('rsa-encrypt-btn');
const rsaDecryptBtn = document.getElementById('rsa-decrypt-btn');
const rsaText = document.getElementById('rsa-text');
const rsaResult = document.getElementById('rsa-result');
const rsaPublicKey = document.getElementById('rsa-public-key');
const rsaPrivateKey = document.getElementById('rsa-private-key');
const rsaResultContainer = document.getElementById('rsa-result-container');

const historyTableBody = document.getElementById('history-table-body');
const noHistoryMessage = document.getElementById('no-history-message');

// Application state
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let encryptionHistory = JSON.parse(localStorage.getItem('encryptionHistory')) || [];
let rsaKeys = {
    publicKey: '',
    privateKey: ''
};

// Toggle password visibility
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function () {
        const inputId = this.dataset.target;
        const input = document.getElementById(inputId);
        const icon = this.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Initialize the app
function init() {
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showEncryptionSection();
    }

    // Generate RSA keys on startup
    generateRSAKeys();

    // Set up event listeners
    setupEventListeners();
    
    // Create particles
    createParticles();
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5;
        
        // Random animation
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s linear infinite`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float {
            0% {
                transform: translate(0, 0);
            }
            50% {
                transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
            }
            100% {
                transform: translate(0, 0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Set up all event listeners
function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Password visibility toggles
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const inputId = this.id.replace('toggle-', '');
            const input = document.getElementById(inputId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    changePasswordForm.addEventListener('submit', handleChangePassword);

    // Encryption buttons
    aesEncryptBtn.addEventListener('click', encryptWithAES);
    aesDecryptBtn.addEventListener('click', decryptWithAES);
    rsaEncryptBtn.addEventListener('click', encryptWithRSA);
    rsaDecryptBtn.addEventListener('click', decryptWithRSA);

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.relative');
            const input = container.querySelector('input, textarea');
            navigator.clipboard.writeText(input.value)
                .then(() => showToast('Copied to clipboard!'))
                .catch(() => showToast('Failed to copy!', true));
        });
    });

    // Modal buttons
    changePasswordBtn.addEventListener('click', () => changePasswordModal.classList.remove('hidden'));
    closeChangePassword.addEventListener('click', () => changePasswordModal.classList.add('hidden'));
    cancelChangePassword.addEventListener('click', () => changePasswordModal.classList.add('hidden'));
    closeToast.addEventListener('click', () => toast.classList.add('hidden'));

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
}

// Switch between tabs
function switchTab(tabName) {
    // Update active tab styling
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('tab-active');
        } else {
            tab.classList.remove('tab-active');
        }
    });

    // Show the corresponding content
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

// Show toast notification
function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center border border-gray-700 ${isError ? 'bg-red-900' : 'bg-gray-800'} text-white`;
    toast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Hash password using SHA-256
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// Handle user registration
function handleRegister(e) {
e.preventDefault();

const name = document.getElementById('register-name').value;
const email = document.getElementById('register-email').value;
const password = document.getElementById('register-password').value;
const confirmPassword = document.getElementById('register-confirm-password').value;

// Validate inputs
if (password !== confirmPassword) {
 showToast('Passwords do not match!', true);
 return;
}

// Check if user already exists
if (users.some(user => user.email === email)) {
 showToast('User with this email already exists!', true);
 return;
}

// Create new user
const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
    encryptionHistory: [], // Initialize an empty encryption history
    decryptionHistory: [], // Initialize an empty encryption history
    privateKey: rsaKeys.privateKey // Assign the generated private key
};

// Save user
users.push(newUser);
localStorage.setItem('users', JSON.stringify(users));

// Clear form
registerForm.reset();

// Switch to login tab
switchTab('login');
showToast('Registration successful! Please login.');
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Update users array from localStorage
    users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(user => user.email === email);
    
    if (!user) {
        showToast('User not found!', true);
        return;
    }
    
    // Verify password
    if (user.password !== hashPassword(password)) {
        showToast('Invalid password!', true);
        return;
    }
    
    // Login successful
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Clear form
    loginForm.reset();
    
    // Show encryption section
    showEncryptionSection(currentUser.name);
    showToast(`Welcome back, ${user.name}!`);
}


// Handle password change
function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validate inputs
    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match!', true);
        return;
    }
    
    // Verify current password
    if (currentUser.password !== hashPassword(currentPassword)) {
        showToast('Current password is incorrect!', true);
        return;
    }
    
    // Update password
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    users[userIndex].password = hashPassword(newPassword);
    currentUser.password = hashPassword(newPassword);
    
    // Save updates
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Clear form and close modal
    changePasswordForm.reset();
    changePasswordModal.classList.add('hidden');
    
    showToast('Password changed successfully!');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthSection();
    showToast('Logged out successfully!');
}

// Show authentication section
function showAuthSection() {
    authSection.classList.remove('hidden');
    encryptionSection.classList.add('hidden');
    welcomeMessage.classList.add('hidden');
    logoutBtn.classList.add('hidden');
}

// After successful login or registration
function showEncryptionSection(username) {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("encryption-section").classList.remove("hidden");
    document.getElementById("welcome-message").classList.remove("hidden");
    document.getElementById("logout-btn").classList.remove("hidden");
    document.getElementById("username-display").textContent = username;
    loadEncryptionHistory();
}


// Generate RSA key pair
function generateRSAKeys() {
    const crypt = new JSEncrypt({default_key_size: 2048});
    rsaKeys.publicKey = crypt.getPublicKey();
    rsaKeys.privateKey = crypt.getPrivateKey();
    
    // Display keys
    rsaPublicKey.value = rsaKeys.publicKey;
    rsaPrivateKey.value = rsaKeys.privateKey;
}

// Encrypt text with AES
function encryptWithAES() {
    const text = aesText.value.trim();
    
    if (!text) {
        showToast('Please enter text to encrypt!', true);
        return;
    }
    
    // Generate a random key and IV
    const key = CryptoJS.lib.WordArray.random(32); // 256 bits
    const iv = CryptoJS.lib.WordArray.random(16); // 128 bits
    
    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
    
    // Combine IV and ciphertext
    const result = iv.toString() + encrypted.toString();
    
    // Display results
    aesResult.value = result;
    aesKey.value = key.toString();
    aesResultContainer.classList.remove('hidden');
    aesKeyContainer.classList.remove('hidden');
    
    // Save to history
    addToHistory('AES', text, result, key.toString());

    // Save to user's encryption history
    if (currentUser) {
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].encryptionHistory.push({ type: 'AES', original: text, result, key: key.toString(), date: new Date().toISOString() });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Decrypt text with AES
function decryptWithAES() {
    const encryptedText = aesText.value.trim();
    const key = prompt('Enter the encryption key:');
    
    if (!encryptedText || !key) {
        showToast('Please enter encrypted text and key!', true);
        return;
    }
    
    try {
        // Extract IV (first 32 hex chars)
        const iv = CryptoJS.enc.Hex.parse(encryptedText.substring(0, 32));
        
        // Extract ciphertext (rest)
        const ciphertext = encryptedText.substring(32);
        
        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(key), { iv: iv });
        
        // Display result
        aesResult.value = decrypted.toString(CryptoJS.enc.Utf8);
        aesResultContainer.classList.remove('hidden');
        aesKeyContainer.classList.add('hidden');
        
        // Save to history
        addToHistory('AES Decrypt', encryptedText, decrypted.toString(CryptoJS.enc.Utf8));

        // Save to user's decryption history
        if (currentUser) {
            const userIndex = users.findIndex(user => user.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].decryptionHistory.push({ type: 'AES Decrypt', original: encryptedText, result: decrypted.toString(CryptoJS.enc.Utf8), date: new Date().toISOString() });
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
    } catch (error) {
        showToast('Decryption failed! Invalid key or text.', true);
        console.error(error);
    }
}

// Encrypt text with RSA
function encryptWithRSA() {
    const text = rsaText.value.trim();
    
    if (!text) {
        showToast('Please enter text to encrypt!', true);
        return;
    }
    
    const crypt = new JSEncrypt();
    crypt.setPublicKey(rsaKeys.publicKey);
    const encrypted = crypt.encrypt(text);
    
    if (!encrypted) {
        showToast('Encryption failed! Text might be too long.', true);
        return;
    }
    
    // Display results
    rsaResult.value = encrypted;
    rsaResultContainer.classList.remove('hidden');
    
    // Save to history
    addToHistory('RSA', text, encrypted);

    // Save to user's encryption history
    if (currentUser) {
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].encryptionHistory.push({ type: 'RSA', original: text, result: encrypted, date: new Date().toISOString() });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Decrypt text with RSA
function decryptWithRSA() {
    const encryptedText = rsaText.value.trim();
    
    if (!encryptedText) {
        showToast('Please enter text to decrypt!', true);
        return;
    }
    
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(rsaKeys.privateKey);
    const decrypted = crypt.decrypt(encryptedText);
    
    if (!decrypted) {
        showToast('Decryption failed! Invalid text or key.', true);
        return;
    }
    
    // Display result
    rsaResult.value = decrypted;
    rsaResultContainer.classList.remove('hidden');
    
    // Save to history
    addToHistory('RSA Decrypt', encryptedText, decrypted);

    // Save to user's decryption history
    if (currentUser) {
        const userIndex = users.findIndex(user => user.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].decryptionHistory.push({ type: 'RSA Decrypt', original: encryptedText, result: decrypted, date: new Date().toISOString() });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Add operation to history
function addToHistory(type, original, result, key = '') {
    if (!currentUser) return;
    
    const entry = {
        id: Date.now().toString(),
        userId: currentUser.id,
        type,
        original,
        result,
        key,
        date: new Date().toISOString()
    };
    
    encryptionHistory.unshift(entry);
    localStorage.setItem('encryptionHistory', JSON.stringify(encryptionHistory));
    
    // Update user's encryption or decryption history
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    if (userIndex !== -1) {
        if (type.toLowerCase().includes('decrypt')) {
            users[userIndex].decryptionHistory.unshift(entry);
        } else {
            users[userIndex].encryptionHistory.unshift(entry);
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Update UI
    loadEncryptionHistory();
}

// Load encryption history for current user
function loadEncryptionHistory() {
    if (!currentUser) return;
    
    const userHistory = encryptionHistory.filter(entry => entry.userId === currentUser.id);
    
    if (userHistory.length === 0) {
        noHistoryMessage.classList.remove('hidden');
        return;
    }
    
    noHistoryMessage.classList.add('hidden');
    historyTableBody.innerHTML = '';
    
    userHistory.forEach(entry => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleString();
        
        // Shorten long texts for display
        const displayOriginal = entry.original.length > 30 ? 
            entry.original.substring(0, 30) + '...' : entry.original;
        const displayResult = entry.result.length > 30 ? 
            entry.result.substring(0, 30) + '...' : entry.result;
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">${entry.type}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400" title="${entry.original}">${displayOriginal}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400" title="${entry.result}">${displayResult}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${formattedDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                <button class="text-indigo-400 hover:text-indigo-300 view-entry" data-id="${entry.id}">View</button>
            </td>
        `;
        
        historyTableBody.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-entry').forEach(btn => {
        btn.addEventListener('click', function() {
            const entryId = this.getAttribute('data-id');
            viewHistoryEntry(entryId);
        });
    });
}

// View full history entry
function viewHistoryEntry(entryId) {
    const entry = encryptionHistory.find(e => e.id === entryId);
    if (!entry) return;
    
    // Create a modal to display the full entry
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-200">Encryption Details</h3>
                <button class="text-gray-400 hover:text-gray-300 close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <div class="p-3 bg-gray-700 rounded-lg text-gray-200">${entry.type}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Original Text</label>
                    <textarea class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-200" rows="3" readonly>${entry.original}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Result</label>
                    <textarea class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-200" rows="3" readonly>${entry.result}</textarea>
                </div>
                ${entry.key ? `
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Encryption Key</label>
                    <input type="text" class="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-gray-200" value="${entry.key}" readonly>
                </div>
                ` : ''}
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <div class="p-3 bg-gray-700 rounded-lg text-gray-200">${new Date(entry.date).toLocaleString()}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking the close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
