import {
    registerUser,
    getVerifyEmailPage,
    loginUser,
    getUserProfile
} from '../services/auth.service.js';

// PAGES

export const registerPageController = async (req, res) => {
    // res.render('auth/register', { title: 'User Registration' });
    res.send('REGISTER PAGE');
};

export const verifyEmailPageController = async (req, res) => {
    try {
        const { id, token } = req.params;

        const result = await getVerifyEmailPage(id, token);

        const { status, error, message } = result;

        if (error) {
            return res.status(status).json({
                error,
                message
            });
        }

        // If the request accepts HTML, render the EJS view
        if (req.accepts('html')) {
            // res.render('auth/verifyEmail', { title: 'VERIFY ACCOUNT', email });

            res.send('VERIFY PAGE');
        }

        // If the request accepts JSON, send the data as JSON
        if (req.accepts('json')) {
            return res.status(200).json(result);
        }
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Internal server error.'
        });
    }
};

export const loginPageController = async (req, res) => {
    // res.render('auth/login', { title: 'User Login' });
    res.send('LOGIN PAGE');
};

// userProfile
// Renders the user's profile page with their name, email and the courses they have registered for.

export const userProfilepageController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getUserProfile(id);

        const { status, error, message } = result;

        if (error) {
            return res.status(status).json({
                error,
                message
            });
        }

        // If the request accepts HTML, render the EJS view
        if (req.accepts('html')) {
            return res.render('user/profile', {
                title: 'User Profile',
                success: true,
                user: result
            });
        }

        // If the request accepts JSON, send the data as JSON
        if (req.accepts('json')) {
            return res.status(200).json({
                success: true,
                user: result
            });
        }
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// FUNCTIONS

// register
// Registers a new user and saves their details in the database. The selected courses are also saved in the user's document.

/**
 * @openapi
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Registration successful
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
 *       '400':
 *         description: Bad request
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

export const registerUserController = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const result = await registerUser({ email, password, firstName, lastName });

        const { status, error, message } = result;

        if (error) {
            return res.status(status).json({
                error,
                message
            });
        }

        return res.status(200).json({
            result
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: 'An error occurred while registering the user.'
        });
    }
};

// verifyEmail
// Verifies the user's email address.
/**
 * @openapi
 * /api/v1/user/verify/email:
 *   post:
 *     summary: Verifies the user's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 description: One-time password sent to the user's email.
 *                 example: 123456
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: Email verification successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the verification was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: Email verification successful! You can now log in to your account.
 *                 redirect:
 *                   type: string
 *                   description: URL to redirect the user to after verification.
 *                   example: /
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Whether an error occurred.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Whether an error occurred.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

export const verifyEmailController = async (req, res) => {
    const { id, otp } = req.body;
    try {
        const result = await verifyEmail(id, otp);

        const { status, error, message } = result;

        if (error) {
            return res.status(status).json({
                error,
                message
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, message: 'Internal server error.' });
    }
};

// login
// Logs in the user and creates a JWT cookie for the session.

/**
 * @openapi
 * /api/v1/user/login:
  post:
    summary: Logs in a user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              email:
                type: string
              password:
                type: string
    responses:
      '200':
        description: The email address provided does not match any existing accounts
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: 'The email address provided does not match any existing accounts. Please double-check the email address or create a new account.'
      '401':
        description: Incorrect email or password, account not verified or verification token expired
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: 'Incorrect email or password. Please make sure you have entered the correct email and password combination.'
              examples:
                verification_required:
                  value:
                    error: true
                    message: 'Your account has not been fully verified yet. Please check your email for a verification code and enter it below to complete the verification process and access your account.'
                verification_token_expired:
                  value:
                    success: true
                    message: 'Your verification code has expired. Verification codes are valid for 24 hours, A New verification code has been sent to your email.'
      '500':
        description: Internal server error
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: 'Internal server error'
      'default':
        description: Unexpected error
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: boolean
                  example: true
                message:
                  type: string
                  example: 'Unexpected error'
    security:
      - cookieAuth: []

*/

export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        const { status, error, message } = result;

        if (error) {
            return res.status(status).json({
                error,
                message
            });
        }

        res.cookie(process.env.JWT_NAME, result.token, {
            httpOnly: true,
            maximumAge: process.env.MAX_AGE
        });

        res.status(200).json({
            success: true,
            message: result.message,
            redirect: result.redirect
        });
    } catch (error) {
        const errorMessage = handleErrors(error);
        res.status(500).json({
            error: true,
            message: errorMessage
        });
    }
};

// userLogout
// Logs out the user and clears the JWT cookie.
/**
 * @openapi
 * /logout:
 *   get:
 *     summary: Log out the currently authenticated user.
 *     description: Clears the JWT cookie and redirects the user to the home page.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Successfully logged out and redirected to the home page.
 */
export const userLogout = async (req, res) => {
    res.clearCookie(process.env.JWT_NAME);
    res.redirect('/');
};
