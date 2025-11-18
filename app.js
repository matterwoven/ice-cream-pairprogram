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
app.set('view engine', 'ejs');

// Enable static file serving (client side file that does not communicate with database)
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));

const PORT = 3001;

app.get('/db-test', async(req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders');
        res.send(orders);
    }   catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Database error: ' + err.message);
    }
});

app.get('/', (req, res) => {
    // res.sendFile(`${import.meta.dirname}/views/home.html`);
    res.render('home');
})

app.get('/admin', async(req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
        res.render('admin', { orders });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error loading orders ' + err.message);

    }
})

// app.post('/submit-order', (req, res) => {
//     let order = req.body;
//     // insert rec into db
//     console.log(req.body);
//     res.render('confirm', {order});
// })


app.post('/confirm', async (req, res) => {
    try {
        const order = req.body;
        
        console.log('New order submitted:', order);
        
        order.toppings = Array.isArray(order.toppings) ?
        order.toppings.join(", ") : "";

        order.timestamp = new Date();
        
        const sql = 
        `INSERT INTO orders(timestamp, customer, email, flavor, cone, toppings)
        VALUES (?, ?, ?, ?, ?, ?);`;
        const params = [
            order.timestamp,
            order.fname,
            order.email,
            order.flavor,
            order.cone,
            order.toppings,
        ];
        
        const [result] = await pool.execute(sql, params);
        console.log('Order saved with ID: ', result.insertId);
        
        // res.render('confirm', { order });
        res.render('confirm', { 
            order: {
                ...order,
                toppings: order.toppings ? order.toppings.split(", ") : []
            }
        });
        
    } catch (err) {
        console.error('Error saving order:', err);
        res.status(500).send('Sorry, there was an error processing your order. Please try again')
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})