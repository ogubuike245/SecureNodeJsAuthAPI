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

const userRouter = express.Router();

// GET ROUTES
userRouter.get('/register', registerPage);
userRouter.get('/verify/:email', verifyEmailPage);
userRouter.get('/login', loginPage);
userRouter.get('/profile/:id', userProfilepage);
userRouter.get('/logout', userLogout);

// POST ROUTES
userRouter.post('/register', register);
userRouter.post('/verify/email', verifyEmail);
userRouter.post('/login', login);

module.exports = userRouter;
