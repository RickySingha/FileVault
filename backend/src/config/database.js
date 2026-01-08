import {Pool} from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'file_vault',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMilli: 30000,
    connectionTimeOutMilli: 2000,
});

pool.on('connect',()=>{
    console.log('Connected to PostgreSql');
});

pool.on('error',(err)=>{
    console.error('Database error in connecting', error);
    process.exit(-1);
})
export default pool;