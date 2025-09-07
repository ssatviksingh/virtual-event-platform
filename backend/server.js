const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config(); // load environment variables from .env file
const app = express(); // create express app

app.use(cors()); // enable cors
app.use(express.json()); // parse json body

// Connect to DB
connectDB(); // connect to db

// Routes
app.use('/api/auth', require('./routes/authRoutes')); // auth routes
app.use('/api/events', require('./routes/eventRoutes')); // event routes

const PORT = process.env.PORT || 5000; // port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // start server
