// Import necessary packages
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import middleware functions
import { allowedMethods } from './middleware/methods.middleware.js';
import { checkForLoggedInUser } from './middleware/auth.middleware.js';

// Import function to connect to MongoDB
import connectToDatabase from './config/config.js';

//Import app routes
import userRoutes from './routes/auth.routes.js';

// Create a new instance of the Express application
const app = express();

// Call the function to connect to MongoDB
connectToDatabase(app);

// Set EJS as the view engine and specify the views directory
app.set('view engine', 'ejs');
app.set('views');

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

// Apply middleware for routes
app.use(checkForLoggedInUser);

// Define the application routes
app.get('/', (_, response) => {
    response.send('<h1>HELLO</h1>');
});
app.use('/api/v1/auth', userRoutes);

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
