import bcrypt from 'bcrypt';
import User from '../models/auth.model.js';
import Token from '../models/token.model.js';
import { sendVerificationEmail } from '../utils/sendmail.js';
import {
    generateOneTimePasswordAndSave,
    createToken,
    generateOneTimePassword
} from '../utils/helpers.js';

export const registerUser = async function (userData) {
    try {
        const { email, password, firstName, lastName } = userData;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return {
                error: true,
                message:
                    'A user with that email address already exists. Please try again with a different email address or log in to your existing account.',
                status: 400
            };
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

        return {
            success: true,
            message:
                'Registration successful! A verification email has been sent to your email address. Please follow the instructions in the email to complete the verification process and log in to your account.',
            status: 201
        };
    } catch (error) {
        console.log(error);
        return {
            error: true,
            message: error.message,
            status: 500
        };
    }
};

export const getVerifyEmailPage = async function (id, token) {
    try {
        // CHECK IF THE USER EXISTS
        const existingUser = await User.findById({ id });
        if (!existingUser) {
            return {
                error: true,
                message: 'User not found.',
                status: 404
            };
        }

        // CHECK IF THE USER HAS ALREADY BEEN VERIFIED
        if (existingUser.isVerified) {
            return {
                error: true,
                message: 'Email has already been verified.',
                status: 400
            };
        }

        // FIND THE TOKEN FOR THE USER
        const existingToken = await Token.findOne({
            user: existingUser?._id,
            value: token
        });

        if (!existingToken) {
            return {
                error: true,
                message: 'Token not found.',
                status: 404
            };
        }

        // Return the result object
        return {
            success: true,
            email,
            status: 200
        };
    } catch (error) {
        return {
            error: true,
            message: 'Internal server error.',
            status: 500
        };
    }
};

export const verifyEmail = async function (id, otp) {
    try {
        if (!otp) {
            return {
                error: true,
                message: 'Please input OTP.',
                status: 400
            };
        }

        const existingUser = await User.findById({ id });

        if (!existingUser) {
            return {
                error: true,
                message: 'User does not exist.',
                status: 400
            };
        }

        const existingToken = await Token.findOne({ user: existingUser._id, generatedOTP: otp });

        if (!existingToken) {
            return {
                error: true,
                message: 'Token not found or has expired.',
                status: 400
            };
        }

        const isValidOTP = await bcrypt.compare(otp, existingToken.value);

        if (!isValidOTP) {
            return {
                error: true,
                message: 'Invalid OTP.',
                status: 400
            };
        }

        await User.updateOne({ _id: existingUser._id }, { $set: { isVerified: true } });

        await Token.deleteOne({ user: existingUser._id, generatedOTP: otp });

        return {
            success: true,
            message: 'Email verification successful! You can now log in to your account.',
            redirect: '/',
            status: 200
        };
    } catch (error) {
        console.log(error);
        return {
            error: true,
            message: 'Internal server error.',
            status: 500
        };
    }
};

export const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return {
                error: true,
                status: 404,
                message:
                    'The email address provided does not match any existing accounts. Please double-check the email address or create a new account.'
            };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                error: true,
                status: 401,
                message:
                    'Incorrect email or password. Please make sure you have entered the correct email and password combination.'
            };
        }

        if (!user.isVerified) {
            const existingToken = await Token.findOne({ user: user._id });

            if (existingToken) {
                return {
                    error: true,
                    status: 403,
                    message:
                        'Your account has not been fully verified yet. Please check your email for a verification code and enter it below to complete the verification process and access your account.'
                };
            } else {
                const newToken = await generateOneTimePasswordAndSave(user._id);
                await sendVerificationEmail(user, newToken.generatedOTP);
                return {
                    success: true,
                    status: 403,
                    message:
                        'Your verification code has expired. Verification codes are valid for 24 hours,  A New verification code has been sent to your email.'
                };
            }
        }

        const token = createToken(user._id);
        return {
            success: true,
            status: 200,
            message: 'login Successful',
            redirect: '/',
            token
        };
    } catch (error) {
        throw new Error(handleErrors(error));
    }
};

export const getUserProfile = async function (id) {
    try {
        const user = await User.findById(id);

        if (!user) {
            return {
                error: true,
                status: 404,
                message: 'User not found'
            };
        }

        return {
            success: true,
            status: 200,
            data: user
        };
    } catch (error) {
        return {
            error: true,
            status: 500,
            message: 'Internal server error'
        };
    }
};
