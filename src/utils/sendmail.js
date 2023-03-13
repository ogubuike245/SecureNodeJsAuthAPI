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

// This is a module that exports a function called sendVerificationEmail that sends an email to a specified email address containing an OTP and a verification link.
// The function first imports the nodemailer module to enable email sending.
// It then creates a transporter object by calling the createTransport function of nodemailer with a configuration object containing the email service,
//  the email address and password, which are environment variables set in a .env file.
// The function then creates a mailOptions object that contains the sender, recipient, subject, and body of the email. The body is an HTML string that contains the generated OTP and a link to the verification page, which is also an environment variable set in the .env file.
// Finally, the function uses the transporter object to send the email by calling the sendMail method, passing in the mailOptions object. If the email is sent successfully, the function logs a message indicating the email address to which the email was sent. If there is an error sending the email, the function logs an error and throws the error.
