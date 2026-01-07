import express from 'express';

const router = express.Router();

import * as fileController from '../controllers/fileController.js';

import {validateUpload,validateFileId} from '../middleware/validator.js';

router.post('/upload', validateUpload,fileController.uploadFile);

router.get('/download/:fileID',validateFileId,fileController.downloadFile);

router.get('/info/:fileID',validateFileId,fileController.getFileInfo);

export default router