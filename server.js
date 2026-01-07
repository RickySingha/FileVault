// import express from 'express'
import app from './src/app.js';
const port = 3000
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    // console.log(`🔗 http://localhost:${PORT}`);
});

server.on('error',(error)=>{
    if(error.code == 'EADDRINUSE'){
        console.log(`${port} already in use`);
        process.exit(1);
    }
    else{
        console.log(error);
        process.exit(1);
    }

});

process.on('SIGTERM',()=>{
    console.log('Shutting down');
    server.close(()=>{
        console.log('Server is being shut down');
        process.exit(0);
    });
});
