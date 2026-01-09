import { v4 as uuidv4 } from 'uuid';
// import { encryptFile } from '../../fileEncryption';
import pool from '../config/database.js';

const fileStore = new Map();

class FileModel {
    static async create(fileData){
        const fileId = uuidv4();
        console.log(fileId);

        const fileSize = Math.round((fileData.encryptedFile.length * 3) / 4);

        const query  =`INSERT INTO files(
        file_id,filename,salt,wrapped_key,encrypted_file,file_size,uploaded_at,download_count)
        VALUES($1,$2,$3,$4,$5,$6,NOW(),0)
        RETURNING file_id,filename,file_size,uploaded_at`;
        const record = [
            fileId,
            fileData.filename,
            fileData.salt,
            fileData.wrappedKey,
            fileData.encryptedFile,
            fileSize
        ];
        try{
            const result = await pool.query(query,record);
            console.log(`${fileId} data inserted into database`);
            const file = result.rows[0];
            //return in camelcase for parsing into other files
            return {
                fileId : file.file_id,
                fileName: file.filename,
                salt:file.salt,
                wrappedKey: file.wrappedKey,
                encryptedFile  :file.encrypted_file,
                fileSize : file.file_size,
                uploadedAt : file.uploaded_at,
                downloadCount : file.download_count,
                lastDownloadedAt  :file.last_downloaded_at
            };
        }catch(error){
            console.error('Inserting operation error',error);
            throw new Error('Failed to store in database');

        }
    };

    static async findById(fileId){

        const query = `SELECT file_id,filename,salt,wrapped_key,encrypted_file,
        file_size,uploaded_at,download_count,last_downloaded_at FROM files
        where file_id = $1`;
        
        try{
            const result = await pool.query(query,[fileId]);
            if (result.rows.length === 0){
                return null;
            }
            const file = result.rows[0];
            //return in camelcase for parsing into other files
            return {
                fileId : file.file_id,
                fileName: file.filename,
                salt:file.salt,
                wrappedKey: file.wrapped_key,
                encryptedFile  :file.encrypted_file,
                fileSize : file.file_size,
                uploadedAt : file.uploaded_at,
                downloadCount : file.download_count,
                lastDownloadedAt  :file.last_downloaded_at
            };
        } catch (error){
            console.error('Error finding the file', error);
            throw new Error('File doesnt exist in the database');
        }


        
    }
    
    // increment download count
    static async incrementDownloadCount(fileId) {
        const query = `UPDATE files SET download_count = download_count+1,last_downloaded_at = NOW()
         WHERE file_id = $1 RETURNING download_count`;

        try{
            const result = await pool.query(query,[fileId]);
            if(result.rows.length>0 ){
                console.log(`Download count for ${fileId} : ${result.rows[0].download_count}`);
                return result.rows[0];
            }
            return null
        } catch(error){
            console.error('Error in updating download count');
            throw new Error('Failed to update count')
        }
        
    }
    // delete file not implemented into db yet
    
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
