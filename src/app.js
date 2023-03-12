const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const allowedMethods = require('./middleware/methods.middleware');
const connectToDatabase = require('./config/config');
// Include the routes

// Connect to MongoDB
const app = express();
connectToDatabase(app);

// connectToDatabase(app);
// Use EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES AND STATIC
app.use(express.static('./public'));
// Parse incoming request bodies as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Parse cookies
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
// Allowed request methods
app.use(allowedMethods);

//APP ROUTES

app.get('/', (_, response) => {
    response.send('<h1>HELLO</h1>');
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error to the console
    console.error(err.stack);

    // Determine the status code and error message to send to the client
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send the error response to the client
    res.status(statusCode).json({ error: true, message });
};

// Register the error handling middleware function
app.use(errorHandler);
