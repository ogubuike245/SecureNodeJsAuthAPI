const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// CHECK IF THERE IS A LOGGED IN USER FROM THE JWT TOKEN

const checkForLoggedInUser = async (request, res, next) => {
    try {
        const token = request.cookies.gubi;
        if (!token) return next();

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken.id);

        if (!user) return res.redirect('/api/v1/user/register');

        request.user = res.locals.user = user;

        return next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            // Token has expired, clear cookie and return error response
            res.clearCookie('gubi');
            res.status(401).json({
                error: true,
                message: ' Session has expired., Please log in again.'
            });
        } else {
            // Other errors, log and return error response
            console.error(err);
            request.user = res.locals.user = null;
            return next(err);
        }
    }
};

// CHECK FOR IF THE USER IS LOGGED IN BEFORE REDIRECTING USER
const isLoggedIn = (request, response, next) => {
    if (request.user) {
        response.redirect('/api/v1/user');
    } else {
        next();
    }
};

// CHECK TO SEE IF THE  JSON WEB TOKEN EXISTS AND ALSO IF THE TOKEN HAS BEEN VERIFIED
const tokenVerification = async (request, res, next) => {
    try {
        const token = request.cookies.gubi;

        if (!token) {
            return res.redirect('/api/v1/user/login');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.id);

        // Attach user ID to request object and response locals

        request.user = res.locals.user = user;

        return next();
    } catch (err) {
        console.error(err);
        return res.redirect('/api/v1/user/login');
    }
};

module.exports = {
    tokenVerification,
    isLoggedIn,
    checkForLoggedInUser
};
