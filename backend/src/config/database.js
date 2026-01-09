import {Pool} from 'pg';

const requiredEnvs = ['DB_HOST','DB_NAME','DB_PORT','DB_USER','DB_PASSWORD'];
const missingEnvs = requiredEnvs.filter(varName => !process.env[varName]);
if (missingEnvs.length > 0){
    console.error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
    process.exit(1);
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ,
    database: process.env.DB_NAME ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
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