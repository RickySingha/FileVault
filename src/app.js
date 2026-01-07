import express from 'express'
import cors from 'cors'

const app = express();

// import fileRoutes from './routes/fileRoutes';

import errorHandler from './middleware/errorHandler.js';

app.use(cors());

app.use(express.json({limit: '50mb'}));

app.use(express.urlencoded({extended : 'true', limit: '50mb'}));


app.use((req,res,next)=>{
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
})

app.get('/health',(req,res)=>{
    res.json({
        status: 'ok',
        timestamp : new Date().toISOString,
        uptime: process.uptime
    });
});

// app.use('/api/files',fileRoutes);

app.use((req,res)=>{
    res.status(404).json({
            success : false,
            error : 'Path not found',
            path : req.path
    });

});

app.use(errorHandler);

export default app;