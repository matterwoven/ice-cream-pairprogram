import express from 'express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();

const app = express();

// Enable static file serving (client side file that does not communicate with database)
app.use(express.static('public'));

const PORT = 3001;

app.get('/db-test', async(req, res) => {
    
})

app.get('/', (req, res) => {
    res.sendFile(`${import.meta.dirname}/views/home.html`);
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})
