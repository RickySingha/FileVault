const errorHandler = (err,req,res,next) => {
    console.error('------ERROR-----');
    console.error('Path',req.path);
    console.error('Method: ',req.method);
    console.error('Error: ',err);
    console.error('Stack: ',err.stack);
    console.error('----------------');
    

    // get status code
    const statusCode = err.statusCode || err.status || 500; 
    const message = err.message || 'Internal Server error';

    res.status(statusCode).json({
        success: false,
        errro : message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err 
        })

    });
    

};

export default errorHandler;