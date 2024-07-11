const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const yup = require('yup');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Require Nodemailer
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
app.use(bodyParser.json());
app.use(cors());

const referralSchema = yup.object().shape({
  referrerName: yup.string().required(),
  referrerEmail: yup.string().email().required(),
  refereeName: yup.string().required(),
  refereeEmail: yup.string().email().required(),
  courseName: yup.string().required(),
  comments: yup.string(),
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'swethapoppoppu@gmail.com', // Your email address
      pass: 'nfcb qcsi wbti zuus', // Your email password or app-specific password
    },
  });

  

app.post('/referrals', async (req, res) => {
  try {
    const data = await referralSchema.validate(req.body, { abortEarly: false });
    const newReferral = await prisma.referral.create({ data });

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.referrerEmail,
      subject: 'Referral Submitted Successfully',
      text: `Dear ${data.referrerName},\n\nYour referral for ${data.refereeName} has been successfully submitted.\n\nRegards,\nYour Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    // Respond with success message
    res.status(200).json({ message: 'Referral submitted successfully', referral: newReferral });
  } catch (err) {
    console.error('Validation Error:', err);
    res.status(400).json({ error: err.errors || 'Invalid data' });
  }
});
app.get('/get', (req, res) => {
  res.status(200).send('Server is deployed and running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
