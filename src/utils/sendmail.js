const nodemailer = require('nodemailer');

async function sendVerificationEmail(user, generatedOTP) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: 'Email Verification OTP',
        html: `<h1> Your OTP is ${generatedOTP} </h1>
          <a href="${process.env.VERIFY_URL}/${user.email}">CLICK ON THIS LINK TO GO TO VERIFICATION PAGE</a>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent successfully to ${user.email}.`);
    } catch (error) {
        console.error(`Error sending verification email to ${user.email}:`, error);
        throw error;
    }
}

module.exports = { sendVerificationEmail };
