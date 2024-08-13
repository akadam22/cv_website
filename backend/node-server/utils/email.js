// require('dotenv').config();
// const nodemailer = require('nodemailer');

// // Create a transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT, 10),
//   secure: process.env.SMTP_SECURE === 'true',
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('SMTP Connection Error:', error);
//   } else {
//     console.log('SMTP Connection successful.');
//   }
// });

// // Function to send email
// const sendEmail = (to, subject, text) => {
//   const mailOptions = {
//     from: process.env.SMTP_USER,
//     to,
//     subject,
//     text
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
