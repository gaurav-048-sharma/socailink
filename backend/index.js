require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;


const connectDb = require('./config/connectDb');
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
})

app.listen(PORT , (req, res) => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})