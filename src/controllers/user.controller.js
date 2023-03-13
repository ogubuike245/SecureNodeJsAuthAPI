const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { sendVerificationEmail } = require('../utils/sendmail');

// PAGES

exports.registerPage = async (req, res) => {
    res.render('auth/register', { title: 'User Registration' });
};

exports.verifyEmailPage = async (req, res) => {
    try {
        // GET VALUES FROM REQUEST PARAMS
        const { email } = req.params;

        // VERIFY IF THE VALUES EXIST
        if (!email) {
            return res.status(400).json({
                error: true,
                message: 'Email is required.'
            });
        }

        // CHECK IF THE USER EXISTS
        const existingUser = await User.findOne({ email });
        if (existingUser.isVerified) {
            return res.status(400).json({
                error: true,
                message: 'Email has already been verified.'
            });
        }
        const existingToken = await Token.findOne({
            user: existingUser?._id
        });

        if (!existingUser) {
            return res.status(404).json({
                error: true,
                message: 'User not found.'
            });
        }

        if (!existingToken) {
            return res.status(404).json({
                error: true,
                message: 'Token not found.'
            });
        }

        // If the request accepts HTML, render the EJS view
        if (req.accepts('html')) {
            res.render('auth/verifyEmail', { title: 'VERIFY ACCOUNT', email });
        }

        // If the request accepts JSON, send the data as JSON
        if (req.accepts('json')) {
            return res.status(200).json({
                success: true,
                email
            });
        }
    } catch (error) {
        res.status(500).json({
            error: true,
            message: 'Internal server error.'
        });
    }
};

exports.loginPage = async (req, res) => {
    res.render('auth/login', { title: 'User Login' });
};

// userProfile
// Renders the user's profile page with their name, email and the courses they have registered for.

exports.userProfilepage = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }

        // If the request accepts HTML, render the EJS view
        if (req.accepts('html')) {
            return res.render('user/profile', {
                title: 'User Profile',
                success: true,
                user
            });
        }

        // If the request accepts JSON, send the data as JSON
        if (req.accepts('json')) {
            return res.status(200).json({
                success: true,
                user
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

exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: true,
                message:
                    'A user with that email address already exists. Please try again with a different email address or log in to your existing account.'
            });
        }

        // Generate and hash the OTP
        const generatedOTP = generateOneTimePassword();
        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(generatedOTP, saltRounds);

        // Hash password and save the user data along with the encrypted OTP in the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isVerified: false
        });

        const token = new Token({
            value: hashedOtp,
            generatedOTP,
            user: newUser._id
        });

        await newUser.save();
        await token.save();

        await sendVerificationEmail(newUser, generatedOTP);

        res.status(200).json({
            success: true,
            message:
                'Registration successful! A verification email has been sent to your email address. Please follow the instructions in the email to complete the verification process and log in to your account.'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error
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
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: true, message: 'Please provide both email and OTP.' });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ error: true, message: 'User with that email does not exist.' });
        }

        const existingToken = await Token.findOne({ user: existingUser._id });

        if (!existingToken) {
            return res.status(400).json({ error: true, message: 'Token not found or has expired.' });
        }

        const isValidOTP = await bcrypt.compare(otp, existingToken.value);

        if (!isValidOTP) {
            return res.status(400).json({ error: true, message: 'Invalid OTP.' });
        }

        await User.updateOne({ _id: existingUser._id }, { $set: { isVerified: true } });

        await Token.deleteOne({ _id: existingToken._id });

        res.status(200).json({
            success: true,
            message: 'Email verification successful! You can now log in to your account.',
            redirect: '/'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: errorMessage });
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

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                error: true,
                message:
                    'The email address provided does not match any existing accounts. Please double-check the email address or create a new account.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: true,
                message: 'Incorrect email or password. Please make sure you have entered the correct email and password combination.'
            });
        }

        if (!user.isVerified) {
            // check if there is an existing token for the user
            const existingToken = await Token.findOne({ user: user._id });

            if (existingToken) {
                // verification token already exists,
                return res.status(401).json({
                    error: true,
                    message:
                        'Your account has not been fully verified yet. Please check your email for a verification code and enter it below to complete the verification process and access your account.'
                });
            } else {
                // generate new verification token and send it
                const newToken = await generateOneTimePasswordAndSave(user._id);
                await sendVerificationEmail(user, newToken.generatedOTP);
                return res.status(401).json({
                    success: true,
                    message:
                        'Your verification code has expired. Verification codes are valid for 24 hours,  A New verification code has been sent to your email.'
                });
            }
        }

        res.cookie(process.env.JWT_NAME, createToken(user._id), {
            httpOnly: true,
            maximumAge: process.env.MAX_AGE
        });

        res.status(200).json({
            success: true,
            message: 'login Successful',
            redirect: '/'
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
exports.userLogout = async (req, res) => {
    res.clearCookie(process.env.JWT_NAME);
    res.redirect('/');
};

// RESUSABLE FUNCTIONS

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.MAX_AGE
    });
};

// GENERATE OTP OF FOUR DIGITS
function generateOneTimePassword() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// GENERATE OTP AND SAVE TO TOKEN MODEL
async function generateOneTimePasswordAndSave(userId) {
    const generatedOTP = generateOneTimePassword();
    await Token.deleteOne({ user: userId });
    const hashedOtp = await bcrypt.hash(generatedOTP, 10);
    const token = new Token({ value: hashedOtp, user: userId, generatedOTP });
    await token.save();
    return { hashedOTP: hashedOtp, generatedOTP: generatedOTP };
}

// GET NEW OTP FUNCTION
async function getNewOTP(res, user) {
    // generate new verification token and send it
    const newToken = await generateOneTimePasswordAndSave(user._id);
    await sendVerificationEmail(user, newToken.generatedOTP);
    return res.status(401).json({
        success: true,
        message:
            'Your verification code has expired. Verification codes are valid for 24 hours,  A New verification code has been sent to your email.'
    });
}
