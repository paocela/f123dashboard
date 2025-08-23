import { GenezioDeploy, GenezioMethod  } from "@genezio/types";
import { MailService } from "@genezio/email-service";
import { Pool } from "pg";

@GenezioDeploy()
export class EmailService {
    from = "noreply@raceforfederica.com";
    pool = new Pool({
        connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
        ssl: true,
    });

    async sendEmail(email: string, subject: string, htmlContent: string) {
        const response = await MailService.sendMail({
        emailServiceToken: process.env.EMAIL_SERVICE_TOKEN ?? (() => { throw new Error("EMAIL_SERVICE_TOKEN is not defined"); })(),
        from: this.from,
        to: email,
        subject: subject,
        html: htmlContent,
        });

        if (!response.success) {
        return response.errorMessage;
        }

        return "success";
    }

    @GenezioMethod({ type: "cron", cronString: "* * * * *" })
    async sendIncomingRaceMail() {
        try {
            // Get upcoming races within 4 hours
            // const upcomingRacesResult = await this.pool.query(`
            //     SELECT gp.id, gp.date, t.name as track_name, t.country, gp.has_sprint, gp.has_x2
            //     FROM gran_prix gp
            //     JOIN tracks t ON gp.track_id = t.id
            //     WHERE gp.date >= NOW() 
            //       AND gp.date <= NOW() + INTERVAL '4 hours'
            //     ORDER BY gp.date ASC
            //     LIMIT 2;
            // `);

            const upcomingRacesResult = await this.pool.query(`
                SELECT gp.id, gp.date, t.name as track_name, t.country, gp.has_sprint, gp.has_x2
                FROM gran_prix gp
                JOIN tracks t ON gp.track_id = t.id
                ORDER BY gp.date ASC
                LIMIT 2;
            `);
            console.debug("Upcoming races within 4 hours:", upcomingRacesResult.rows);
            const upcomingRaces = upcomingRacesResult.rows;

            // If no races are starting soon, exit early
            if (upcomingRaces.length === 0) {
                console.log("No upcoming races within 4 hours");
                return;
            }

            // Get active users' emails
            const activeUsersResult = await this.pool.query(`
                SELECT id, username, name, surname, mail
                FROM fanta_player
                WHERE is_active = true AND mail IS NOT NULL AND mail != '';
            `);

            const activeUsers = activeUsersResult.rows;

            if (activeUsers.length === 0) {
                console.log("No active users found");
                return;
            }

            // Prepare email content
            const raceDetails = upcomingRaces.map(race => {
                const raceDate = new Date(race.date);
                const sprintInfo = race.has_sprint === 1 ? " (con Sprint)" : "";
                const multiplierInfo = race.has_x2 === 1 ? " - <strong style='color: #ff6b35;'>PUNTI DOPPI!</strong>" : "";
                return `
                    <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; border-radius: 5px;">
                        <div style="font-size: 18px; font-weight: bold; color: #333;">🏁 ${race.track_name}, ${race.country}${sprintInfo}${multiplierInfo}</div>
                        <div style="margin-top: 8px; color: #666; font-size: 14px;">⏰ Inizio alle: ${raceDate.toLocaleString('it-IT')}</div>
                    </div>
                `;
            }).join('');

            const subject = `🚨 Avviso Gara Imminente - ${upcomingRaces.length} gara/e in arrivo!`;

            // Send emails to all active users
            const emailPromises = activeUsers.map(async (user) => {
                try {
                    // Use the mail field from the database
                    const userEmail = user.mail;
                    
                    // Create personalized HTML message for each user
                    const htmlMessage = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Race for Federica - Avviso Gara</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                            
                            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none;">
                                <h2 style="color: #333; margin-top: 0;">Ciao ${user.username}! 👋</h2>
                                
                                <p style="font-size: 16px; margin-bottom: 20px;">
                                    Le seguenti gare stanno per iniziare:
                                </p>
                                
                                ${raceDetails}
                                
                                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0; color: #856404; font-weight: bold;">
                                        ⚠️ Non dimenticare di controllare e aggiornare la tua votazione prima dell'inizio della gara!
                                    </p>
                                </div>
                                
                                <p style="margin-bottom: 15px;">
                                    Buona fortuna e che vinca il pilota più veloce! 🏆
                                </p>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <div style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; border-top: 2px solid #007bff;">
                                        <p style="margin: 0; color: #666; font-size: 13px;">
                                            <strong style="color: #333;">Team Race for Federica</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #666;">
                                <p style="margin: 0;">
                                    Questa è una email automatica. Non rispondere a questo messaggio.
                                </p>
                            </div>
                        </body>
                        </html>
                    `;
                    
                    const result = await this.sendEmail(userEmail, subject, htmlMessage);
                    console.log(`Email sent to ${user.name} ${user.surname} (${userEmail}): ${result}`);
                    return result;
                } catch (error) {
                    console.error(`Failed to send email to ${user.name} ${user.surname}:`, error);
                    return `Failed: ${error}`;
                }
            });

            const results = await Promise.all(emailPromises);
            console.log(`Sent ${results.filter(r => r === 'success').length} successful emails out of ${activeUsers.length} attempts`);

        } catch (error) {
            console.error("Error in sendIncomingRaceMail:", error);
        }
    }

}