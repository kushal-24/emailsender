import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import csv from "csv-parser"; // install with: npm install csv-parser
import dotenv from 'dotenv'

dotenv.config()


// === CONFIGURE MAIL TRANSPORTER ===
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    family: 4,    // force IPv4
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  
console.log("Email user:", process.env.EMAIL_USER);


// === FUNCTION TO READ CSV FILE ===
async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
}

// === FUNCTION TO SEND SINGLE MAIL ===
async function sendCertificateMail({ name, email, certNumber }) {
    try {
        const certPath = path.join(process.cwd(), "public", `${certNumber}.png`); //change made here

        if (!fs.existsSync(certPath)) {
            console.warn(`Certificate not found for ${name}. Sending mail without attachment.`);
        }

        const mailOptions = {
            from: '"KUSHAL PHADNIS" <24mm01019@iitbbs.ac.in>',
            to: email,
            subject: "LudoHack Participation Certificate",
            html: `
          <p>Dear ${name},</p>
          <p>body ........................................................abscacbkjbfwubcislFWHBLU</p>
          <p>Best regards,<br/>
          <strong>Harshshreyash Singh</strong></p>
        `,
            // attachments: [
            //     {
            //         filename: `${name}_certificate.png`,
            //         path: certPath,
            //     },
            // ],
        };


        const info = await transporter.sendMail(mailOptions);
        console.log(` Sent to ${name}: ${info.response}`)
    } 
    catch (error) {
        console.error(`Failed to send to ${ name }:`, error.message);
    }
}

// === MAIN FUNCTION ===
async function sendAllCertificates() {
    const csvFilePath = path.join(process.cwd(), "trial.csv"); // CSV file in root
    const participants = await readCSV(csvFilePath);

    console.log(`Loaded ${ participants.length } participants from CSV`);

    for (let i = 0; i < participants.length; i++) {
        const { Name, Email } = participants[i]; // CSV headers must be "Name" and "Email"
        await sendCertificateMail({
            name: Name,
            email: Email,
            certNumber: i + 1, // match 1.png → 1st person, 2.png → 2nd, etc.
        });
    }

    console.log("All mails processed successfully!");
}

sendAllCertificates();