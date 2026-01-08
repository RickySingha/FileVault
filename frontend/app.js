// app.js - Frontend Application Logic

import {
    generateFileKey,
    encryptFile,
    decryptFile,
    deriveKeyFromPassword,
    generateSalt,
    wrapFileKey,
    unwrapFileKey,
    arrayToBase64,
    base64ToArray
} from './fileEncryption.js';

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════
const API_URL = 'http://localhost:3000/api/files';

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════
function showElement(id) {
    document.getElementById(id).classList.add('show');
}

function hideElement(id) {
    document.getElementById(id).classList.remove('show');
}

function clearResult(id) {
    const element = document.getElementById(id);
    element.classList.remove('show', 'success', 'error', 'info');
}

// ═══════════════════════════════════════
// FILE SELECTION HANDLER
// ═══════════════════════════════════════
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const fileInfo = document.getElementById('fileInfo');
    
    if (file) {
        fileInfo.innerHTML = `
            <strong>📄 ${file.name}</strong><br>
            Size: ${(file.size / 1024).toFixed(2)} KB<br>
            Type: ${file.type || 'Unknown'}
        `;
        showElement('fileInfo');
    } else {
        hideElement('fileInfo');
    }
});

// ═══════════════════════════════════════
// UPLOAD FUNCTION
// ═══════════════════════════════════════
window.uploadFile = async function() {
    const fileInput = document.getElementById('fileInput');
    const password = document.getElementById('uploadPassword').value;
    const uploadBtn = document.getElementById('uploadBtn');
    const loading = document.getElementById('uploadLoading');
    const result = document.getElementById('uploadResult');

    // Validation
    if (!fileInput.files[0]) {
        alert('Please select a file');
        return;
    }
    if (!password || password.length < 6) {
        alert('Please enter a password (minimum 6 characters)');
        return;
    }

    const file = fileInput.files[0];

    try {
        // UI State
        uploadBtn.disabled = true;
        showElement('uploadLoading');
        clearResult('uploadResult');

        console.log('🔒 Step 1: Reading file...');
        const fileData = await file.arrayBuffer();

        console.log('🔑 Step 2: Generating encryption keys...');
        const salt = generateSalt();
        const masterKey = await deriveKeyFromPassword(password, salt);
        const fileKey = await generateFileKey();

        console.log('🔐 Step 3: Encrypting file...');
        const encryptedFile = await encryptFile(new Uint8Array(fileData), fileKey);

        console.log('🔒 Step 4: Wrapping file key...');
        const wrappedKey = await wrapFileKey(fileKey, masterKey);

        console.log('📦 Step 5: Preparing upload data...');
        const uploadData = {
            filename: file.name,
            salt: arrayToBase64(salt),
            wrappedKey: arrayToBase64(new Uint8Array(wrappedKey)),
            encryptedFile: arrayToBase64(encryptedFile)
        };

        console.log('📤 Step 6: Uploading to server...');
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uploadData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        if (data.success) {
            result.innerHTML = `
                <strong>✅ Upload Successful!</strong><br><br>
                <strong>File ID:</strong><br>
                <code style="background: #f8f9fa; padding: 8px; display: block; border-radius: 4px; margin: 8px 0; word-break: break-all;">${data.data.fileId}</code>
                <strong>Filename:</strong> ${data.data.filename}<br>
                <strong>Uploaded:</strong> ${new Date(data.data.uploadedAt).toLocaleString()}<br><br>
                <strong>⚠️ SAVE THIS FILE ID!</strong><br>
                You will need it to download your file.
            `;
            result.classList.add('success', 'show');
            
            // Clear form
            fileInput.value = '';
            document.getElementById('uploadPassword').value = '';
            hideElement('fileInfo');
        } else {
            throw new Error('Upload failed: Invalid response from server');
        }

    } catch (error) {
        console.error('❌ Upload error:', error);
        result.innerHTML = `
            <strong>❌ Upload Failed</strong><br><br>
            ${error.message}
        `;
        result.classList.add('error', 'show');
    } finally {
        uploadBtn.disabled = false;
        hideElement('uploadLoading');
    }
};

// ═══════════════════════════════════════
// DOWNLOAD FUNCTION
// ═══════════════════════════════════════
window.downloadFile = async function() {
    const fileId = document.getElementById('downloadFileId').value.trim();
    const password = document.getElementById('downloadPassword').value;
    const loading = document.getElementById('downloadLoading');
    const result = document.getElementById('downloadResult');

    // Validation
    if (!fileId) {
        alert('Please enter a file ID');
        return;
    }
    if (!password) {
        alert('Please enter the password');
        return;
    }

    // Track if decryption actually succeeded
    let decryptionSucceeded = false;
    let downloadedFilename = '';

    try {
        showElement('downloadLoading');
        clearResult('downloadResult');

        console.log('📥 Step 1: Downloading from server...');
        const response = await fetch(`${API_URL}/download/${fileId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'File not found');
        }

        console.log('🔓 Step 2: Converting base64 data...');
        const salt = base64ToArray(data.data.salt);
        const wrappedKey = base64ToArray(data.data.wrappedKey);
        const encryptedFile = base64ToArray(data.data.encryptedFile);
        downloadedFilename = data.data.filename;

        console.log('🔑 Step 3: Deriving master key from password...');
        const masterKey = await deriveKeyFromPassword(password, salt);

        console.log('🔓 Step 4: Unwrapping file key...');
        // THIS is where wrong password will fail!
        const fileKey = await unwrapFileKey(wrappedKey, masterKey);

        console.log('🔐 Step 5: Decrypting file...');
        // THIS is where corrupted data will fail!
        const decryptedData = await decryptFile(encryptedFile, fileKey);

        // If we reach here, decryption succeeded!
        decryptionSucceeded = true;
        if (decryptionSucceeded){
        try {
            await fetch(`${API_URL}/download/${fileId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('✅ Download count updated');
        } catch (err) {
            console.warn('⚠️ Failed to update download count:', err);
            // Don't fail the whole operation if this fails
        }
    }

        console.log('💾 Step 6: Triggering download...');
        const blob = new Blob([decryptedData]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadedFilename;
        a.click();
        URL.revokeObjectURL(url);

        // Only show success if decryption actually worked
        result.innerHTML = `
            <strong>✅ Download Successful!</strong><br><br>
            <strong>File:</strong> ${downloadedFilename}<br>
            <strong>Size:</strong> ${(decryptedData.byteLength / 1024).toFixed(2)} KB<br>
            <strong>Uploaded:</strong> ${new Date(data.data.uploadedAt).toLocaleString()}<br><br>
            The file has been decrypted and downloaded to your device.
        `;
        result.classList.add('success', 'show');

        // Clear form only on success
        document.getElementById('downloadFileId').value = '';
        document.getElementById('downloadPassword').value = '';

    } catch (error) {
        console.error('❌ Download error:', error);
        
        // Determine error type
        let errorMsg = error.message;
        let errorType = 'Unknown error';

        // Check for specific error types
        if (error.name === 'OperationError' || error.message.includes('unwrap')) {
            errorType = 'Wrong Password';
            errorMsg = 'The password you entered is incorrect. Please check your password and try again.';
        } else if (error.message.includes('decrypt')) {
            errorType = 'Decryption Failed';
            errorMsg = 'Failed to decrypt the file. The file may be corrupted or the password is wrong.';
        } else if (error.message.includes('File not found') || error.message.includes('404')) {
            errorType = 'File Not Found';
            errorMsg = 'No file exists with this ID. Please check the File ID and try again.';
        } else if (error.message.includes('Server error')) {
            errorType = 'Server Error';
            errorMsg = error.message;
        }

        result.innerHTML = `
            <strong>❌ ${errorType}</strong><br><br>
            ${errorMsg}
        `;
        result.classList.add('error', 'show');

        // DO NOT clear form on error so user can try again
    } finally {
        hideElement('downloadLoading');
    }
};

// ═══════════════════════════════════════
// GET FILE INFO FUNCTION
// ═══════════════════════════════════════
window.getFileInfo = async function() {
    const fileId = document.getElementById('infoFileId').value.trim();
    const loading = document.getElementById('infoLoading');
    const result = document.getElementById('infoResult');

    if (!fileId) {
        alert('Please enter a file ID');
        return;
    }

    try {
        showElement('infoLoading');
        clearResult('infoResult');

        console.log('📋 Fetching file info...');
        const response = await fetch(`${API_URL}/info/${fileId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'File not found');
        }

        const info = data.data;
        result.innerHTML = `
            <div class="file-details">
                <div><strong>File ID:</strong> ${info.fileId}</div>
                <div><strong>Filename:</strong> ${info.filename}</div>
                <div><strong>Uploaded:</strong> ${new Date(info.uploadedAt).toLocaleString()}</div>
                <div><strong>Downloads:</strong> ${info.downloadCount || 0}</div>
                ${info.fileSize ? `<div><strong>Size:</strong> ${(info.fileSize / 1024).toFixed(2)} KB</div>` : ''}
            </div>
        `;
        result.classList.add('info', 'show');

    } catch (error) {
        console.error('❌ Info error:', error);
        
        let errorMsg = error.message;
        if (error.message.includes('File not found') || error.message.includes('404')) {
            errorMsg = 'No file exists with this ID.';
        }

        result.innerHTML = `
            <strong>❌ Error</strong><br><br>
            ${errorMsg}
        `;
        result.classList.add('error', 'show');
    } finally {
        hideElement('infoLoading');
    }
};