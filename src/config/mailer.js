import nodemailer from "nodemailer";
import {EMAIL_FROM_NAME, GMAIL_APP_PASSWORD, GMAIL_USER} from "./env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

transporter.verify((error) => {
    if (error) {
        console.warn("⚠️ Mailer connection failed:", error.message);
    } else {
        console.log("✅ Mailer ready");
    }
});

/**
 * @param {{to: string, subject: string, html: string, text?: string}} options
 */

export const sendEmail = async ({to, subject, html, text}) => {
    const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME}" <${GMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
    });

    console.log(`📧 Email sent to ${to} - ID: ${info.messageId}`);
    return info;
};