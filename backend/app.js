require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const connectDb = require('./config/connectDb');
connectDb();
const authRoute = require('./route/authRoute.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests from the client URL
    credentials: true // Allow cookies to be sent with requests
}));

app.get('/', (req, res) => {
  return res.send(`Welcome, the routes are set Lets go `);
});

app.use('/api/auth', authRoute)

// app.listen(PORT , (req, res) => {
//     console.log(`Server is running on port http://localhost:${PORT}`);
// })

module.exports = app; // Export the app for testing or further configuration