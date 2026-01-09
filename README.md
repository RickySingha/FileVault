# 🔐 File Encryption Vault

> Zero-knowledge, end-to-end encrypted file storage with client-side encryption

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-13%2B-blue)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Security](#-security)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

File Encryption Vault is a secure file storage system that encrypts files **in your browser** before uploading them to the server. The server never has access to your unencrypted files or encryption keys, ensuring true zero-knowledge privacy.

### 🌟 Key Highlights

- 🔒 **End-to-End Encryption** - Files encrypted before leaving your browser
- 🔑 **Password-Based Security** - Only you can decrypt your files
- 🚫 **Zero-Knowledge** - Server cannot access your data
- 🌐 **No Login Required** - Simple file ID + password access
- 🆓 **100% Free & Open Source**

---

## ✨ Features

### Core Features

- ✅ Client-side file encryption (AES-GCM 256-bit)
- ✅ Password-based key derivation (PBKDF2, 600k iterations)
- ✅ Secure key wrapping (AES-KW)
- ✅ Unique random key per file
- ✅ File metadata without decryption
- ✅ Download counter tracking

### Security Features

- ✅ Zero-knowledge architecture
- ✅ No user accounts needed
- ✅ Salt per file
- ✅ HTTPS enforcement
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│                                                             │
│  1. User selects file + enters password                     │
│  2. Generate random file key (AES-GCM 256-bit)              │
│  3. Encrypt file with file key                              │
│  4. Derive master key from password (PBKDF2)                │
│  5. Wrap file key with master key (AES-KW)                  │
│  6. Send encrypted data to server                           │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (Backend API)                    │
│                                                             │
│  • Receives: encrypted file + wrapped key + salt            │
│  • Stores: in PostgreSQL database                           │
│  • Cannot decrypt: no password or master key                │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                      │
│                                                             │
│  Stores:                                                    │
│  • file_id (UUID)                                           │
│  • encrypted_file (Base64)                                  │
│  • wrapped_key (Base64)                                     │
│  • salt (Base64)                                            │
│  • metadata (filename, timestamps)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Upload Flow:
```
User File → Browser Encryption → Server Storage → Database
```

#### Download Flow:
```
Database → Server Retrieval → Browser Decryption → User File
```

**Important:** Server never sees unencrypted data or encryption keys!

---

## 🔐 Security

### Encryption Details

| Component | Algorithm | Key Size | Notes |
|-----------|-----------|----------|-------|
| File Encryption | AES-GCM | 256-bit | Authenticated encryption |
| Key Derivation | PBKDF2 | 256-bit | 600,000 iterations |
| Key Wrapping | AES-KW | 256-bit | RFC 3394 |
| Random Generation | Web Crypto API | - | CSPRNG |

### Security Principles

1. **Zero-Knowledge Architecture**
   - Server has zero access to plaintext data
   - Encryption keys never transmitted
   - Password never sent to server

2. **Defense in Depth**
   - Client-side encryption (first layer)
   - HTTPS transport (second layer)
   - Database encryption at rest (third layer)

3. **Key Management**
   - Unique random key per file
   - Keys wrapped with password-derived master key
   - Master key regenerated on each access

### Threat Model

**Protected Against:**
- ✅ Server compromise (data remains encrypted)
- ✅ Database breach (keys are wrapped)
- ✅ Man-in-the-middle (HTTPS required)
- ✅ Unauthorized access (password required)

**Not Protected Against:**
- ❌ Weak passwords (user responsibility)
- ❌ Client-side malware (browser compromise)
- ❌ Password sharing (user behavior)

### Security Best Practices

**For Users:**
- Use strong, unique passwords
- Never share your password or file ID together
- Download and verify files promptly
- Use HTTPS only

**For Developers:**
- Keep dependencies updated
- Enable rate limiting
- Monitor for suspicious activity
- Regular security audits

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript (ES6+)** - Logic
- **Web Crypto API** - Encryption

### Backend
- **Node.js** (v18+) - Runtime
- **Express.js** - Web framework
- **PostgreSQL** (v13+) - Database
- **pg** - Database driver


### Security Libraries
- **helmet** - Security headers
- **cors** - CORS protection
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variables

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test thoroughly before submitting
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

## 🔄 Changelog

### v1.0.0 (2025-01-09)
- Initial release
- End-to-end encryption
- Zero-knowledge architecture
- File upload/download
- PostgreSQL backend
- Vercel + Render deployment

---
