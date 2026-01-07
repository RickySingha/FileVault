async function generateFileKey(){
    return await crypto.subtle.generateKey({
        name: "AES-GCM",
        length: 256
    },
    true,
    ["encrypt","decrypt"]
);

}

// function to generate file key

async function encryptFile(file,filekey){
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt({

        name: "AES-GCM",
        iv:iv

    },
    filekey,
    file
);
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return result;  // This goes to server
}

// decryption
async function decryptFile(encryptedData, fileKey) {
    // 1. Extract IV (first 12 bytes)
    const iv = encryptedData.slice(0, 12);
    
    // 2. Extract encrypted content (rest of the bytes)
    const ciphertext = encryptedData.slice(12);
    
    // 3. Decrypt
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        fileKey,
        ciphertext
    );
    
    return decrypted;  // Returns ArrayBuffer
}
    
// async function testFullCycle() {
//     console.log("=== ENCRYPTION TEST ===");
    
//     // Original data
//     const originalText = "This is my secret message 🔒";
//     const originalData = new TextEncoder().encode(originalText);
//     console.log("📄 Original:", originalText);
    
//     // Generate key
//     const fileKey = await generateFileKey();
//     console.log("🔑 Key generated");
    
//     // Encrypt
//     const encrypted = await encryptFile(originalData, fileKey);
//     console.log("Encrypted message: ",encrypted)
//     console.log("🔒 Encrypted size:", encrypted.length, "bytes");
    
//     console.log("\n=== DECRYPTION TEST ===");
    
//     // Decrypt
//     const decrypted = await decryptFile(encrypted, fileKey);
//     const decryptedText = new TextDecoder().decode(decrypted);
//     console.log("🔓 Decrypted:", decryptedText);
    
//     // Verify
//     if (originalText === decryptedText) {
//         console.log("✅ SUCCESS! Encryption/Decryption working!");
//     } else {
//         console.log("❌ FAILED! Data doesn't match");
//     }
// }

// // Run it
// testFullCycle();

// Password to master key

async function deriveKeyFromPassword(password,salt) {
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
    //derive master key

    const masterKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 60000,
            hash: "SHA-256"
        },
        passwordKey,
        { name: "AES-KW", length: 256 },  // Output key spec
        false,                             // Not extractable
        ["wrapKey", "unwrapKey"] 
    );
    return masterKey;
    
}
function generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16)); // 128-bit salt
}

// // Usage:
// const salt = generateSalt();
// const masterKey = await deriveKeyFromPassword("user_password", salt);

// wrap file key by masterKey

async function wrapFileKey(fileKey,masterKey){
    return await crypto.subtle.wrapKey(
        "raw",
        fileKey,
        masterKey,
        "AES-KW"
    );
}

// function to unwrap

async function unwrapFileKey(wrappedKey,masterKey){
    return await crypto.subtle.unwrapKey(
        "raw",
        wrappedKey,
        masterKey,
        "AES-KW",
        {
            name: "AES-GCM", length: 256
        },
        true,
        ["encrypt","decrypt"]
    );

}

function arrayToBase64(uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

function base64ToArray(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Export all:
export {
    generateFileKey,
    encryptFile,
    decryptFile,
    deriveKeyFromPassword,
    generateSalt,
    wrapFileKey,      // Add
    unwrapFileKey,    // Add
    arrayToBase64,    // Optional
    base64ToArray     // Optional
};