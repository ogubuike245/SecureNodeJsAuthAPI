const express = require('express');

const {
    register,
    login,
    verifyEmail,
    verifyEmailPage,
    userProfilepage,
    userLogout,
    loginPage,
    registerPage
} = require('../controllers/user.controller');
const { isLoggedIn } = require('../middleware/auth.middleware');

const userRouter = express.Router();

// GET ROUTES
userRouter.get('/register', isLoggedIn, registerPage);
userRouter.get('/verify/:email', isLoggedIn, verifyEmailPage);
userRouter.get('/login', isLoggedIn, loginPage);
userRouter.get('/profile/:id', userProfilepage);
userRouter.get('/logout', userLogout);

// POST ROUTES
userRouter.post('/register', isLoggedIn, register);
userRouter.post('/verify/email', isLoggedIn, verifyEmail);
userRouter.post('/login', isLoggedIn, login);

module.exports = userRouter;
