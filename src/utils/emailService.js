import { sendEmail } from "../config/mailer.js";
import { CLIENT_URL } from "../config/env.js";
import { 
    contactTemplate, 
    passwordResetConfirmationTemplate, 
    passwordResetTemplate, 
    welcomeTemplate
} from "./emailTemplates/index.js";

export const sendWelcomeEmail = ({ name, email }) => sendEmail({
    to: email,
    subject: `Welcome to the LAFIEPLUS platform, ${name}!`,
    html: welcomeTemplate({ name }),
});

export const sendPasswordResetEmail = ({ name, email, resetToken }) => {
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
    return sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: passwordResetTemplate({ name, resetUrl, expiresInMinutes: 10 }),
    });
};

export const sendPasswordResetConfirmationEmail = ({ name, email }) => sendEmail({
    to: email,
    subject: "Your Password Has Been Changed Successfully",
    html: passwordResetConfirmationTemplate({ name }),
});

export const sendContactEmail = ({ name, email, subject, message }) => sendEmail({
    to: email,
    subject,
    html: contactTemplate({name, subject, message}),
});