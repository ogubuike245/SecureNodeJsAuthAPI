const jwt = require('jsonwebtoken');
const Token = require('../models/token.model');

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

module.exports = {
    getNewOTP,
    generateOneTimePasswordAndSave,
    createToken,
    generateOneTimePassword
};
