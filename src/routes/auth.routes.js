const express = require('express');

const {
    registerPageController,
    verifyEmailPageController,
    loginPageController,
    userProfilepageController,
    registerUserController,
    verifyEmailController,
    loginUserController,
    userLogout
} = require('../controllers/user.controller');
const { isLoggedIn } = require('../middleware/auth.middleware');

const userRouter = express.Router();

// GET ROUTES
userRouter.get('/register', isLoggedIn, registerPageController);
userRouter.get('/verify/:email', isLoggedIn, verifyEmailPageController);
userRouter.get('/login', isLoggedIn, loginPageController);
userRouter.get('/profile/:id', userProfilepageController);
userRouter.get('/logout', userLogout);

// POST ROUTES
userRouter.post('/register', isLoggedIn, registerUserController);
userRouter.post('/verify/email', isLoggedIn, verifyEmailController);
userRouter.post('/login', isLoggedIn, loginUserController);

module.exports = userRouter;
