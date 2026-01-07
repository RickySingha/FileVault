import { v4 as uuidv4 } from 'uuid';
// import { encryptFile } from '../../fileEncryption';

const fileStore = new Map();

class FileModel {
    static async create(fileData){
        const fileId = uuidv4();
        console.log(fileId);
        const record = {
            fileId,
            filename: fileData.filename,
            salt: fileData.salt,
            wrappedKey : fileData.wrappedKey,
            encryptedFile : fileData.encryptedFile,
            uploadedAt: new Date().toISOString(),
            downloadCount: 0,
            lastDownloadedAt: null
        };
        fileStore.set(fileId,record);
        console.log('Stored in db');
        return record;
    };

    static async findById(fileId){
        const file = fileStore.get(fileId);

        return file || null;
    }
    
    // increment download count
    static async incrementDownloadCount(fileId) {
        const file = fileStore.get(fileId);
        
        if (file) {
            file.downloadCount++;
            file.lastDownloadedAt = new Date().toISOString();
            fileStore.set(fileId, file);
            
            console.log(`📊 Download count for ${fileId}: ${file.downloadCount}`);
        }
        
        return file;
    }
    // delete file
    
    static async deleteById(fileId){
        const deleted = fileStore.delete(fileId);
        if(deleted){
            console.log('File deleted');
        }

    }
    static async getAll() {
        return Array.from(fileStore.values());
    }

    // ═══════════════════════════════════════
    // COUNT - Total files
    // ═══════════════════════════════════════
    static async count() {
        return fileStore.size;
    }
}

export default FileModel
