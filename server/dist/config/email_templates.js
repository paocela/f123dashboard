/**
 * Email Templates for Race for Federica
 *
 * This file contains all email templates used throughout the application.
 * Templates are organized by function and include both HTML and plain text versions.
 */
/**
 * Generate email template for password reset by admin
 */
export function getPasswordResetEmailTemplate(user, newPassword) {
    const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Race for Federica - Password Modificata</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">
                <img style="height: 20px; vertical-align: middle;" src="https://f123dashboard.app.genez.io/assets/images/logo_raceforfederica.png" alt="Race for Federica Logo">
                Race for Federica
                <img style="height: 20px; vertical-align: middle;" src="https://f123dashboard.app.genez.io/assets/images/logo_raceforfederica.png" alt="Race for Federica Logo">
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Fantasy F1 Championship</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <h2 style="color: #333; margin-top: 0; font-size: 16px">Ciao ${user.username}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                Un amministratore ha modificato la tua password su Race for Federica.
            </p>
            
            <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 5px;">
                <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px;">🔐 Nuova Password Temporanea</div>
                <div style="font-size: 18px; font-family: 'Courier New', monospace; background-color: #fff; padding: 15px; border-radius: 5px; border: 1px dashed #667eea; text-align: center; letter-spacing: 2px; color: #333;">
                    <strong>${newPassword}</strong>
                </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <div style="font-weight: bold; color: #856404; margin-bottom: 8px;">⚠️ Importante - Sicurezza</div>
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    Cambia la Password al primo accesso
                </p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <a href="https://f123dashboard.app.genez.io" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; text-decoration: none; padding: 15px 30px; 
                          border-radius: 25px; font-weight: bold; font-size: 16px; 
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                          border: none; font-family: Arial, sans-serif;">
                    Accedi Ora 🔓
                </a>
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #666;">
                Dopo aver effettuato l'accesso, puoi cambiare la tua password dalle impostazioni del profilo.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <div style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; border-top: 2px solid #667eea;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        <strong style="color: #333;">Team Race for Federica</strong>
                    </p>
                </div>
            </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 11px; color: #666;">
            <p style="margin: 0; font-size: 10px">
                Questa è una email automatica. Non rispondere a questo messaggio.
            </p>
            <p style="margin: 5px 0 0 0; font-size: 10px">
                Se non hai richiesto questa modifica, contatta immediatamente un amministratore.
            </p>
        </div>
    </body>
    </html>
  `;
    const textMessage = `
    Race for Federica - Fantasy F1 Championship

    Ciao ${user.username}!

    Un amministratore ha modificato la tua password su Race for Federica.

    🔐 Nuova Password Temporanea: ${newPassword}

    ⚠️ IMPORTANTE - SICUREZZA:
    Cambia la Password al primo accesso

    Accedi ora su: https://f123dashboard.app.genez.io

    Dopo aver effettuato l'accesso, puoi cambiare la tua password dalle impostazioni del profilo.

    ---
    Team Race for Federica
    Questa è una email automatica. Non rispondere a questo messaggio.
    Se non hai richiesto questa modifica, contatta immediatamente un amministratore.
  `;
    return {
        html: htmlMessage,
        text: textMessage.trim()
    };
}
/**
 * Generate email template for upcoming races notification
 */
export function getUpcomingRaceEmailTemplate(user, races) {
    // Prepare race details for HTML
    const raceDetailsHtml = races.map(race => {
        const raceDate = new Date(race.date);
        const sprintInfo = race.has_sprint === 1 ? " (con Sprint)" : "";
        const multiplierInfo = race.has_x2 === 1 ? " - <strong style='color: #ff6b35;'>PUNTI DOPPI!</strong>" : "";
        return `
      <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; border-radius: 5px;">
          <div style="font-size: 18px; font-weight: bold; color: #333;">🏁 ${race.track_name}, ${race.country}${sprintInfo}${multiplierInfo}</div>
          <div style="margin-top: 8px; color: #666; font-size: 14px;">⏰ Inizio oggi alle: ${raceDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;
    }).join('');
    // Prepare race details for plain text
    const raceDetailsText = races.map(race => {
        const raceDate = new Date(race.date);
        const sprintInfo = race.has_sprint === 1 ? " (con Sprint)" : "";
        const multiplierInfo = race.has_x2 === 1 ? " - PUNTI DOPPI!" : "";
        return `${race.track_name}, ${race.country}${sprintInfo}${multiplierInfo}\nInizio oggi alle: ${raceDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    }).join('\n\n');
    const subject = `Gara in arrivo - ${races.length} gara/e oggi su Race for Federica`;
    const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Race for Federica - Avviso Gara</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">
                <img style="height: 20px; vertical-align: middle;" src="https://f123dashboard.app.genez.io/assets/images/logo_raceforfederica.png" alt="Race for Federica Logo">
                Race for Federica
                <img style="height: 20px; vertical-align: middle;" src="https://f123dashboard.app.genez.io/assets/images/logo_raceforfederica.png" alt="Race for Federica Logo">
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Fantasy F1 Championship</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <h2 style="color: #333; margin-top: 0; font-size: 16px">Ciao ${user.username}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
                Le seguenti gare stanno per iniziare:
            </p>
            
            ${raceDetailsHtml}
            
            <div style="text-align: center; margin: 15px 0;">
                <a href="https://f123dashboard.app.genez.io/#/fanta" 
                   style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                          color: white; text-decoration: none; padding: 15px 30px; 
                          border-radius: 25px; font-weight: bold; font-size: 16px; 
                          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
                          border: none; font-family: Arial, sans-serif;">
                    VOTA ORA! 🗳️ 
                </a>
            </div>
            
            <p style="margin-bottom: 15px; font-size: 16px">
                Buona fortuna e che vinca il pilota più veloce! 🏆
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
                <div style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; border-top: 2px solid #007bff;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        <strong style="color: #333;">Team Race for Federica</strong>
                    </p>
                </div>
            </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 11px; color: #666;">
            <p style="margin: 0;  font-size: 10px">
                Questa è una email automatica. Non rispondere a questo messaggio.
            </p>
        </div>
    </body>
    </html>
  `;
    const textMessage = `
    Race for Federica - Fantasy F1 Championship

    Ciao ${user.username}!

    Le seguenti gare stanno per iniziare:

    ${raceDetailsText}

    Vota la tua squadra su: https://f123dashboard.app.genez.io/#/fanta

    Buona fortuna e che vinca il pilota più veloce!

    ---
    Team Race for Federica
    Questa è una email automatica. Non rispondere a questo messaggio.
    Race for Federica 
  `;
    return {
        html: htmlMessage,
        text: textMessage.trim(),
        subject: subject
    };
}
