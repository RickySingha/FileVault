import express from 'express';

const router = express.Router();

import * as fileController from '../controllers/fileController.js';

import {validateUpload,validateFileId} from '../middleware/validator.js';

router.post('/upload', validateUpload,fileController.uploadFile);

router.get('/download/:fileId',validateFileId,fileController.downloadFile);
router.post('/download/:fileId',validateFileId,fileController.confirmDownload);

router.get('/info/:fileId',validateFileId,fileController.getFileInfo);

export default router