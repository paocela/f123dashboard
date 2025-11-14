import { Pool } from "pg";
import { getUpcomingRaceEmailTemplate } from "../config/email_templates.js";
import nodemailer from "nodemailer";
export class EmailService {
    constructor() {
        this.FROM = "noreply@raceforfederica.com";
        this.pool = new Pool({
            connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
            ssl: true,
        });
    }
    /**
     * Send email using Gmail and Nodemailer
     * @param to recipient email
     * @param subject email subject
     * @param htmlContent HTML body
     * @param textContent plain text body
     */
    async sendGmailEmail(to, subject, htmlContent, textContent) {
        // Gmail credentials from environment variables
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_PASS;
        if (!gmailUser || !gmailPass)
            throw new Error("Gmail credentials not set");
        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });
        // Send mail
        const mailOptions = {
            from: this.FROM,
            to,
            subject,
            html: htmlContent,
            text: textContent,
            replyTo: this.FROM,
        };
        try {
            await transporter.sendMail(mailOptions);
            return "success";
        }
        catch (error) {
            return `Failed: ${error}`;
        }
    }
    // Scheduled chron job to send emails about upcoming races
    async sendIncomingRaceMail() {
        try {
            // Check if the job is enabled via property table
            const propertyResult = await this.pool.query(`
                SELECT value 
                FROM property 
                WHERE name = 'send_incoming_race_mail_enabled'
                LIMIT 1;
            `);
            // If property doesn't exist or value is '0', exit early
            if (propertyResult.rows.length === 0 || propertyResult.rows[0].value === '0') {
                console.log("sendIncomingRaceMail job is disabled via property table");
                return;
            }
            // Get upcoming races within 4 hours
            const upcomingRacesResult = await this.pool.query(`
                SELECT gp.id, gp.date, t.name as track_name, t.country, gp.has_sprint, gp.has_x2
                FROM gran_prix gp
                JOIN tracks t ON gp.track_id = t.id
                WHERE gp.date >= NOW() 
                  AND gp.date <= NOW() + INTERVAL '12 hours'
                ORDER BY gp.date ASC
                LIMIT 2;
            `);
            // FOR TESTING PURPOSES ONLY - COMMENT THE ABOVE AND UNCOMMENT BELOW
            // const upcomingRacesResult = await this.pool.query(`
            //     SELECT gp.id, gp.date, t.name as track_name, t.country, gp.has_sprint, gp.has_x2
            //     FROM gran_prix gp
            //     JOIN tracks t ON gp.track_id = t.id
            //     ORDER BY gp.date ASC
            //     LIMIT 2;
            // `);
            const upcomingRaces = upcomingRacesResult.rows;
            // If no races are starting soon, exit early
            if (upcomingRaces.length === 0) {
                console.log("No upcoming races");
                return;
            }
            // Get active users' emails
            const activeUsersResult = await this.pool.query(`
                SELECT id, username, name, surname, mail
                FROM users
                WHERE is_active = true AND mail IS NOT NULL AND mail != '';
            `);
            const activeUsers = activeUsersResult.rows;
            if (activeUsers.length === 0) {
                console.log("No active users found");
                return;
            }
            // Send emails to all active users
            const emailPromises = activeUsers.map(async (user) => {
                try {
                    // Use the mail field from the database
                    const userEmail = user.mail;
                    // Generate email template using the email templates module
                    const { html, text, subject } = getUpcomingRaceEmailTemplate({ username: user.username, name: user.name, surname: user.surname }, upcomingRaces);
                    const result = await this.sendGmailEmail(userEmail, subject, html, text);
                    console.log(`Email sent to ${user.name} ${user.surname} (${userEmail}): ${result}`);
                    return result;
                }
                catch (error) {
                    console.error(`Failed to send email to ${user.name} ${user.surname}:`, error);
                    return `Failed: ${error}`;
                }
            });
            const results = await Promise.all(emailPromises);
            console.log(`Sent ${results.filter(r => r === 'success').length} successful emails out of ${activeUsers.length} attempts`);
        }
        catch (error) {
            console.error("Error in sendIncomingRaceMail:", error);
        }
    }
}
