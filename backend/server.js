// import express from 'express'
import 'dotenv/config';
import app from './src/app.js';
import pool from './src/config/database.js';

import constants from './src/config/constants.js';

async function startServer(){ 
  try{
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    const server = app.listen(constants.PORT, () => {
    console.log(`Server running on port ${constants.PORT}`);
    console.log(`Environment: ${constants.NODE_ENV}`);
    console.log(`Health: http://localhost:${constants.PORT}/health`);
});

    server.on('error',(error)=>{
    if(error.code == 'EADDRINUSE'){
        console.log(`${constants.PORT} already in use`);
        process.exit(1);
    }
    else{
        console.log(error);
        process.exit(1);
    }

});
    const shutdown = async (signal) => {
        server.close(async ()=>{
            console.log('HTTP server closed');
            await pool.end();
            console.log('Database connection closed');
            process.exit(0);
        })

    setTimeout(()=>{
        console.error('Forced shutdown due to timeout');
        process.exit(1);
    },10000);
};

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
} catch(error){
    console.error('Failed to start server: ',error);
    process.exit(1);
} 
}

startServer();
