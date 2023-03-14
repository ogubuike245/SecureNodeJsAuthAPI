import express from 'express';

import {
    registerPageController,
    verifyEmailPageController,
    loginPageController,
    userProfilepageController,
    registerUserController,
    verifyEmailController,
    loginUserController,
    userLogout
} from '../controllers/auth.controller.js';

import { isLoggedIn } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

// GET ROUTES
userRouter.get('/register', isLoggedIn, registerPageController);
userRouter.get('/verify/:id/user/:token', isLoggedIn, verifyEmailPageController);
userRouter.get('/login', isLoggedIn, loginPageController);
userRouter.get('/profile/:id', userProfilepageController);
userRouter.get('/logout', userLogout);

// POST ROUTES
userRouter.post('/register', isLoggedIn, registerUserController);
userRouter.post('/verify/email', isLoggedIn, verifyEmailController);
userRouter.post('/login', isLoggedIn, loginUserController);

export default userRouter;
