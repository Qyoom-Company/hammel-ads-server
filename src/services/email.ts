const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mellitifiras.freelance@gmail.com",
        pass: "518364518364",
    },
});

export async function sendConfirmationEmail(token: string, email: string) {
    try {
        const mailOptions = {
            from: "mellitifiras@protonmail.com",
            to: email,
            subject: "Email Confirmation - hammel ads",
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               ${process.env.DOMAIN}/api/auth/confirm/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        console.log("subject: ", mailOptions.subject);
        console.log("text: ", mailOptions.text);

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
}

export async function sendPasswordResetEmail(
    resetToken: string,
    email: string
) {
    try {
        const mailOptions = {
            from: "mellitifiras@protonmail.com",
            to: email,
            subject: "Email Confirmation - hammel ads",
            text: `link to reset pass
               ${process.env.DOMAIN}/api/auth/reset/${resetToken}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        console.log("subject: ", mailOptions.subject);
        console.log("text: ", mailOptions.text);

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
}
