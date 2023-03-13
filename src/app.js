// Require necessary packages
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Require middleware functions
const allowedMethods = require('./middleware/methods.middleware');

// Require function to connect to MongoDB
const connectToDatabase = require('./config/config');
const { checkForLoggedInUser } = require('./middleware/auth.middleware');

// Create a new instance of the Express application
const app = express();

// Call the function to connect to MongoDB
connectToDatabase(app);

// Set EJS as the view engine and specify the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define middleware functions and serve static files
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Allow only specific HTTP methods for certain routes
app.use(allowedMethods);

app.use(checkForLoggedInUser);

// Define the application routes
app.get('/', (_, response) => {
    response.send('<h1>HELLO</h1>');
});

// Define an error handling middleware function
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
