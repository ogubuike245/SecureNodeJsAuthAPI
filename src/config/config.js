// Importing the Mongoose package
const mongoose = require('mongoose');

// Extracting the API_PORT and MONG0_DB_URI environment variables
const { API_PORT, MONG0_DB_URI } = process.env;

// Defining an asynchronous function that connects to a MongoDB database
const connectToDatabase = async (app) => {
    try {
        // Connecting to the MongoDB database using the MONG0_DB_URI and some options
        await mongoose.set('strictQuery', false).connect(MONG0_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Starting the app and listening on the API_PORT environment variable (or port 9000 by default)
        app.listen(API_PORT || 9000, () => {
            // Logging a message indicating that the app is running and connected to the database
            console.log(
                ` BACKEND SERVER RUNNING ON PORT : ${API_PORT}  AND CONNECTED TO MONGODB DATABASE`
            );
        });
    } catch (error) {
        // Logging any errors that occur during the database connection or app start-up
        console.log(error);
    }
};

// Exporting the connectToDatabase function so it can be used in other parts of the application
module.exports = connectToDatabase;
