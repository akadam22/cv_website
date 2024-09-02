// const nodemailer = require('nodemailer');

// // Configure your SMTP transport
// const transporter = nodemailer.createTransport({
//   service: 'Gmail', // You can use other services like 'SendGrid', 'Mailgun', etc.
//   auth: {
//     user: process.env.EMAIL_USERNAME, // Your email address
//     pass: process.env.EMAIL_PASSWORD  // Your email password or application-specific password
//   }
// });

// const sendEmail = (to, subject, text) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text
//   };

//   return transporter.sendMail(mailOptions);
// };

// module.exports = { sendEmail };
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let verificationCode = '';

app.post('/api/send-verification-email', (req, res) => {
  const { email } = req.body;
  verificationCode = crypto.randomBytes(3).toString('hex'); // Generate a random verification code

  // Configure the transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use any email service you prefer
    auth: {
      user: 'your-email@gmail.com', // Your email address
      pass: 'your-email-password', // Your email password
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Your verification code is ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending verification email');
    } else {
      console.log('Verification email sent:', info.response);
      res.status(200).send({ verificationCode });
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
