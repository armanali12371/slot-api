const sendEmail = (to, subject, body) => {
    console.log(`Simulated Email Sent!`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  };
  
  module.exports = { sendEmail };
  