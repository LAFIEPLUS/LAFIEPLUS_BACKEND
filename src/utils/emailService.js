import { sendEmail } from "../config/mailer.js";
import { CLIENT_URL } from "../config/env.js";
import {
    consultationAcceptedTemplate,
    consultationMessageTemplate,
    contactTemplate,
    otpTemplate,
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
    html: contactTemplate({ name, subject, message }),
});

export const sendConsultationAcceptedEmail = ({ name, email, partnerName, consultationId }) =>
    sendEmail({
        to: email,
        subject: "Your consultation has been accepted — Lafieplus",
        html: consultationAcceptedTemplate({ name, partnerName, consultationId }),
    });

export const sendConsultationMessageEmail = ({ name, email, senderName, consultationId }) =>
    sendEmail({
        to: email,
        subject: `New message from ${senderName} — Lafieplus`,
        html: consultationMessageTemplate({ name, senderName, consultationId }),
    });

export const sendOtpEmail = ({ name, email, code }) =>
    sendEmail({ to: email, subject: "Your Lafieplus verification code", html: otpTemplate({ name, code }) });