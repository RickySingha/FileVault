import {rateLimit} from 'express-rate-limit';
// Limit for uploading files
const uploadLimiter = rateLimit({
    windowMs: 10*60*1000,
    max: 20,
    message: 'Too many uploads, try again later'

});

// limit for downloading files
const downloadLimiter = rateLimit({
    windowMs: 10*60*1000,
    max:10,
    message : 'Too many downloads attempt, try again later'
});

export {uploadLimiter,downloadLimiter};