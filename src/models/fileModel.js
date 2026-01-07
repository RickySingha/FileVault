import { v4 as uuidv4 } from 'uuid';
// import { encryptFile } from '../../fileEncryption';

const fileStore = new Map();

class FileModel {
    static async create(fileData){
        const fileID = uuidv4();
        const record = {
            fileID,
            filename: fileData.filename,
            salt: fileData.salt,
            wrappedKey : fileData.wrappedKey,
            encryptedFile : fileData.encryptedFile,
            uploadedAt: new Date().toISOString(),
            downloadCount: 0,
            lastDownloadedAt: null
        };
        fileStore.set(fileID,record);
        console.log('Stored in db');
        return record;
    };

    static async findById(fileID){
        const file = fileStore.get(fileID);

        return file || null;
    }
    
    // increment download count
    static async incrementDownloadCount(fileID) {
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
    
    static async deleteById(fileID){
        const deleted = fileStore.delete(fileID);
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
