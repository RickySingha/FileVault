export const constants = {
    MAX_FILE_SIZE :parseInt(process.env.MAX_FILE_SIZE),
    ALLOWED_ORIGINS : process.env.ALLOWED_ORIGINS?.split(','),
    PORT : parseInt(process.env.PORT),
    NODE_ENV : process.env.NODE_ENV,
    DB_CONFIG : {
        host :process.env.DB_HOST,
        port : parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user : process.env.DB_USER
    }
};
export default constants;