var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { GenezioDeploy, GenezioMethod } from "@genezio/types";
import { Pool } from "pg";
import { getUpcomingRaceEmailTemplate } from "./email_templates";
const nodemailer = require("nodemailer");
let EmailService = (() => {
    let _classDecorators = [GenezioDeploy()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _sendIncomingRaceMail_decorators;
    var EmailService = _classThis = class {
        constructor() {
            this.FROM = (__runInitializers(this, _instanceExtraInitializers), "noreply@raceforfederica.com");
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
    };
    __setFunctionName(_classThis, "EmailService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _sendIncomingRaceMail_decorators = [GenezioMethod({ type: "cron", cronString: "0 18 * * *" })];
        __esDecorate(_classThis, null, _sendIncomingRaceMail_decorators, { kind: "method", name: "sendIncomingRaceMail", static: false, private: false, access: { has: obj => "sendIncomingRaceMail" in obj, get: obj => obj.sendIncomingRaceMail }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EmailService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EmailService = _classThis;
})();
export { EmailService };
