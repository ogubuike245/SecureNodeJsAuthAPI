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

/**
 * @swagger
 * /api/v1/auth/register:
 *   get:
 *     summary: Render the registration page.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Render the registration page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>...</html>"
 */
userRouter.get('/register', isLoggedIn, registerPageController);

/**
 * @swagger
 * /api/v1/auth/verify/{id}/user/{token}:
 *   get:
 *     summary: Get verification page for email.
 *     description: Get verification page for email by ID and token.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID.
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token.
 *     responses:
 *       '200':
 *         description: Success.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                   example: true
 *                 email:
 *                   type: string
 *                   description: User email address.
 *                   example: johndoe@example.com
 *       '400':
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indicates whether the request resulted in an error.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Email has already been verified.
 *       '404':
 *         description: Not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indicates whether the request resulted in an error.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: User not found.
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Indicates whether the request resulted in an error.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Internal server error.
 */

userRouter.get('/verify/:id/user/:token', isLoggedIn, verifyEmailPageController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   get:
 *     summary: Render the login page.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Render the login page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<html>...</html>"
 */
userRouter.get('/login', isLoggedIn, loginPageController);
userRouter.get('/profile/:id', userProfilepageController);
userRouter.get('/logout', userLogout);

// POST ROUTES
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user.
 *     requestBody:
 *       description: User data to be registered.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful! A verification email has been sent to your email address. Please follow the instructions in the email to complete the verification process and log in to your account.
 *                 status:
 *                   type: number
 *                   example: 201
 *       400:
 *         description: A user with that email address already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: A user with that email address already exists. Please try again with a different email address or log in to your existing account.
 *                 status:
 *                   type: number
 *                   example: 400
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: An error occurred while registering the user.
 */

userRouter.post('/register', isLoggedIn, registerUserController);
userRouter.post('/verify/email', isLoggedIn, verifyEmailController);
userRouter.post('/login', isLoggedIn, loginUserController);

export default userRouter;
