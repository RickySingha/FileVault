import {Pool} from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
    idleTimeoutMilli: 30000,
    connectionTimeOutMilli: 2000,
  // This logic checks if we are on Render; if yes, it forces SSL
  ssl: process.env.DATABASE_URL.includes('render.com') ? {
    rejectUnauthorized: false
  } : false
});

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT ,
//     database: process.env.DB_NAME ,
//     user: process.env.DB_USER ,
//     password: process.env.DB_PASSWORD ,
//     max: 20,
//     idleTimeoutMilli: 30000,
//     connectionTimeOutMilli: 2000,
// });

pool.on('connect',()=>{
    console.log('Connected to PostgreSql');
});

pool.on('error',(err)=>{
    console.error('Database error in connecting', error);
    process.exit(-1);
})
export default pool;