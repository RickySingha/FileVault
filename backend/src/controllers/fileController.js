// src/controllers/fileController.js

import FileModel from "../models/fileModel.js";

// ═══════════════════════════════════════
// UPLOAD FILE
// ═══════════════════════════════════════
export const uploadFile = async (req, res, next) => {
    try {
        // Step 1: Extract validated data
        const { filename, salt, wrappedKey, encryptedFile } = req.body;

        console.log(`📤 Uploading file: ${filename}`);

        // Step 2: Save to database (model handles the details)
        const file = await FileModel.create({
            filename,
            salt,
            wrappedKey,
            encryptedFile
        });

        console.log(`✅ File saved with ID: ${file.fileId}`);

        // Step 3: Return success response
        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileId: file.fileId,
                filename: file.fileName,
                uploadedAt: file.uploadedAt
            }
        });

    } catch (error) {
        // Step 4: Pass errors to error handler
        console.error('❌ Upload error:', error);
        next(error);
    }
};

// ═══════════════════════════════════════
// DOWNLOAD FILE
// ═══════════════════════════════════════
export const downloadFile = async (req, res, next) => {
    try {
        // Step 1: Get fileId from URL params
        const { fileId } = req.params;

        

        // Step 2: Fetch from database
        const file = await FileModel.findById(fileId);

        // Step 3: Check if exists
        if (!file) {
            console.log(`❌ File not found: ${fileId}`);
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
        


        // Step 4: Return file data
        res.json({
            success: true,
            data: {
                filename: file.fileName,
                salt: file.salt,
                wrappedKey: file.wrappedKey,
                encryptedFile: file.encryptedFile,
                uploadedAt: file.uploadedAt
            }
        });

    } catch (error) {
        console.error('❌ Download error:', error);
        next(error);
    }
};

export const confirmDownload = async (req,res,next) => {
    try {
        const {fileId} = req.params;
        const file = await FileModel.findById(fileId);
        if(!fileId){
            return res(403).json({
                success : 'false',
                error: 'File not found'
            });
        }
        console.log(`📥 Downloading file: ${fileId}`);
        await FileModel.incrementDownloadCount(fileId);
        console.log(`Download confirmed for ${fileId}`);
        
        res.json({ 
            success: true,
            message: 'Download confirmed',
            downloadCount: file.downloadCount + 1
        });
        
    } catch (error) {
        next(error);
    }
};

// ═══════════════════════════════════════
// GET FILE INFO (metadata only)
// ═══════════════════════════════════════
export const getFileInfo = async (req, res, next) => {
    try {
        const { fileId } = req.params;

        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Return metadata without encrypted content
        res.json({
            success: true,
            data: {
                fileId: file.fileId,
                filename: file.fileName,
                uploadedAt: file.uploadedAt,
                downloadCount: file.downloadCount,
                fileSize: Math.round((file.encryptedFile.length * 3) / 4) // Estimate
            }
        });

    } catch (error) {
        next(error);
    }
};

// export default fileController
