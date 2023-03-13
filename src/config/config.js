const mongoose = require('mongoose');

const { API_PORT, MONG0_DB_URI } = process.env;

const connectToDatabase = async (app) => {
    try {
        await mongoose.set('strictQuery', false).connect(MONG0_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        app.listen(API_PORT || 9000, () => {
            console.log(
                ` BACKEND SERVER RUNNING ON PORT : ${API_PORT}  AND CONNECTED TO MONGODB DATABASE`
            );
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectToDatabase;

/*
This is a Node.js module that exports a function named connectToDatabase. The function takes an app object as a parameter and is responsible for connecting the server to a MongoDB database and starting the server.

First, the module imports the Mongoose library for MongoDB and defines API_PORT and MONG0_DB_URI constants from the environment variables.

The connectToDatabase function uses the mongoose.connect method to connect to the MongoDB database specified by the MONG0_DB_URI variable. It also sets the strictQuery option to false to allow undefined fields in the schema. The useNewUrlParser and useUnifiedTopology options are set to true to avoid deprecation warnings.

If the connection is successful, the function listens to the API_PORT or the default port 9000 and logs a message to the console indicating that the server is running and connected to the database.

If an error occurs while connecting to the database, the function catches the error and logs it to the console.

Finally, the module exports the connectToDatabase function to be used in other parts of the code. The last line is a comment that describes the purpose of the module.


*/
