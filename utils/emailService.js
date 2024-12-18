const mailgun = require('mailgun-js');

const DOMAIN = 'sandbox4fee52ce63c04a4ba4150661729c5a09.mailgun.org'; // Your Mailgun domain
const API_KEY = '7254ca6a23b5fd88b637b8f80dccc4ab-0920befd-74bb15a8'; // Your Mailgun API key

const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

/**
 * Send task notification email
 * @param {string} recipientEmail - The email address of the recipient
 * @param {Object} taskDetails - Details of the task to include in the email
 */
const sendTaskNotification = (recipientEmail, taskDetails) => {

    console.log(recipientEmail)
  const data = {
    from: 'your-email@example.com',  // Replace with your sender email
    to: recipientEmail,             // Recipient email (assigned user)
    subject: `New Task Assigned: ${taskDetails.title}`,
    text: `
      Hi,
      
      A new task has been assigned to you:
      Title: ${taskDetails.title}
      Description: ${taskDetails.description}
      Status: ${taskDetails.status}
      
      Please review the task details and start working on it.

      Regards,
      Your Task Management System
    `,
  };

  mg.messages().send(data, function (error, body) {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", body);
    }
  });
};

module.exports = sendTaskNotification;
