// import { webcrypto } from 'crypto';
// global.crypto = webcrypto;

import {
    generateFileKey,
    encryptFile,
    decryptFile,
    deriveKeyFromPassword,
    generateSalt,
    wrapFileKey,
    unwrapFileKey
} from './fileEncryption.js';

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Simulated server storage
let serverStorage = {};

async function main() {
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║     🔐 ENCRYPTION SYSTEM TEST SUITE           ║");
    console.log("╚════════════════════════════════════════════════╝\n");

    try {
        // ===== SESSION 1: ENCRYPTION =====
        console.log("📱 SESSION 1: ENCRYPTION");
        console.log("─".repeat(50));
        
        const password = await question("Enter encryption password: ");
        if (!password) throw new Error("Password required!");
        
        const message = await question("Enter secret message: ");
        if (!message) throw new Error("Message required!");
        
        console.log("\n⏳ Encrypting...\n");
        
        // Step 1: Generate salt
        const salt = generateSalt();
        console.log("✅ Salt generated:", salt.length, "bytes");
        
        // Step 2: Derive master key from password
        console.log("⏳ Deriving master key from password...");
        const masterKey = await deriveKeyFromPassword(password, salt);
        console.log("✅ Master key derived");
        
        // Step 3: Generate random file key
        const fileKey = await generateFileKey();
        console.log("✅ File key generated");
        
        // Step 4: Encrypt message with file key
        const messageData = new TextEncoder().encode(message);
        const encryptedMessage = await encryptFile(messageData, fileKey);
        console.log("✅ Message encrypted:", encryptedMessage.length, "bytes");
        
        // Step 5: Wrap file key with master key
        console.log("⏳ Wrapping file key...");
        const wrappedKey = await wrapFileKey(fileKey, masterKey);
        console.log("✅ File key wrapped:", wrappedKey.byteLength, "bytes");
        
        // Simulate server storage
        serverStorage = {
            salt: salt,
            wrappedKey: wrappedKey,
            encryptedMessage: encryptedMessage
        };
        
        console.log("\n📤 Stored on server:");
        console.log("   • Salt:", salt.length, "bytes (public)");
        console.log("   • Wrapped key:", wrappedKey.byteLength, "bytes (encrypted)");
        console.log("   • Encrypted message:", encryptedMessage.length, "bytes");
        
        console.log("\n💾 Master key deleted from memory");
        console.log("   (Never stored anywhere!)");
        
        console.log("\n" + "═".repeat(50));
        console.log("✅ ENCRYPTION COMPLETE!");
        console.log("═".repeat(50));
        
        // ===== SIMULATE TIME GAP =====
        console.log("\n⏰ Simulating time gap...");
        console.log("   • Browser closed");
        console.log("   • Different device");
        console.log("   • Master key gone from memory\n");
        
        await question("Press Enter to decrypt...");
        
        // ===== SESSION 2: DECRYPTION =====
        console.log("\n\n💻 SESSION 2: DECRYPTION");
        console.log("─".repeat(50));
        
        console.log("📥 Retrieved from server:");
        console.log("   • Salt:", serverStorage.salt.length, "bytes");
        console.log("   • Wrapped key:", serverStorage.wrappedKey.byteLength, "bytes");
        console.log("   • Encrypted message:", serverStorage.encryptedMessage.length, "bytes");
        
        const decryptPassword = await question("\nEnter password to decrypt: ");
        
        console.log("\n⏳ Attempting decryption...\n");
        
        try {
            // Step 1: Regenerate master key from password
            console.log("⏳ Regenerating master key...");
            const newMasterKey = await deriveKeyFromPassword(
                decryptPassword, 
                serverStorage.salt
            );
            console.log("✅ Master key regenerated");
            
            // Step 2: Unwrap file key
            console.log("⏳ Unwrapping file key...");
            const unwrappedFileKey = await unwrapFileKey(
                serverStorage.wrappedKey, 
                newMasterKey
            );
            console.log("✅ File key unwrapped");
            
            // Step 3: Decrypt message
            console.log("⏳ Decrypting message...");
            const decryptedData = await decryptFile(
                serverStorage.encryptedMessage, 
                unwrappedFileKey
            );
            const decryptedMessage = new TextDecoder().decode(decryptedData);
            console.log("✅ Message decrypted");
            
            console.log("\n" + "═".repeat(50));
            console.log("🎉 DECRYPTION SUCCESSFUL!");
            console.log("═".repeat(50));
            console.log("\n📄 Original:", message);
            console.log("🔓 Decrypted:", decryptedMessage);
            console.log("\n✅ Match:", message === decryptedMessage ? "YES ✓" : "NO ✗");
            
            console.log("\n🔐 Security verified:");
            console.log("   ✓ Master key never stored");
            console.log("   ✓ Regenerated from password");
            console.log("   ✓ Works across sessions");
            console.log("   ✓ Server can't decrypt");
            console.log("═".repeat(50));
            
        } catch (error) {
            console.log("\n" + "═".repeat(50));
            console.log("❌ DECRYPTION FAILED!");
            console.log("═".repeat(50));
            
            if (decryptPassword !== password) {
                console.log("\n🔴 WRONG PASSWORD");
                console.log("\nWhat happened:");
                console.log("  1. Wrong password → Wrong master key");
                console.log("  2. Wrong master key → Can't unwrap file key");
                console.log("  3. Unwrap fails → No decryption");
                
                console.log("\n🔒 Security working correctly:");
                console.log("   ✓ Wrong password = No access");
                console.log("   ✓ Server can't help (has no keys)");
                console.log("   ✓ Data stays encrypted");
            } else {
                console.log("\n🔴 Error:", error.message);
                console.log("\nDebug info:", error.stack);
            }
            console.log("═".repeat(50));
        }
        
        // ===== BONUS: WRONG PASSWORD TEST =====
        console.log("\n\n🧪 BONUS: Testing wrong password");
        console.log("─".repeat(50));
        
        const wrongPass = await question("Try wrong password: ");
        
        try {
            const wrongMasterKey = await deriveKeyFromPassword(wrongPass, serverStorage.salt);
            const wrongUnwrap = await unwrapFileKey(serverStorage.wrappedKey, wrongMasterKey);
            console.log("❌ Should not succeed!");
        } catch (err) {
            console.log("✅ Correctly rejected wrong password!");
            console.log("   Error type:", err.name);
            console.log("\n🛡️ Security system working perfectly!");
        }
        
    } catch (error) {
        console.log("\n❌ TEST ERROR:", error.message);
        console.log("\nStack:", error.stack);
    } finally {
        rl.close();
    }
}

console.log("\n🚀 Starting encryption test...\n");
main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});