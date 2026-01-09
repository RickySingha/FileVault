import constants from '../config/constants.js';
const validateUpload = (req,res,next)=>{
    const {filename,salt,wrappedKey,encryptedFile} = req.body;

    // all params exist

    if (!filename || !salt || !wrappedKey || !encryptedFile){
        return res.status(400).json({
            success : false,
            error: 'Missing params',
            required: ['filename','salt','wrappedKey', 'encryptedFile'],
            received : Object.keys(req.body)

        });
    }

    //filename must be string
    if (typeof filename !== 'string' || filename.trim === ''){
        return res.status(400).json({
            success: false,
            error: 'Invalid filename'
        });
    }

    const estimatedSize = (encryptedFile.length * 3) / 4;
    if (estimatedSize > constants.MAX_FILE_SIZE) {
        return res.status(413).json({
            success: false,
            error: `File too large. Max size: ${MAX_FILE_SIZE/ 1024 / 1024}MB`,
            yourFileSize: `${(estimatedSize / 1024 / 1024).toFixed(2)}MB`
        });
    }
    next();


};

const validateFileId = (req,res,next) => {
    const {fileId} = req.params;

    if (!fileId){
        return res.status(400).json({
            success: false,
            error: 'No field ID'
        });
    }
    //check the uuid format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if(!uuidRegex.test(fileId)){
        return res.status(400).json({
            success : false,
            error: 'Invalid file uuid format'
        });
    }
    next();
};

export {validateUpload,validateFileId};