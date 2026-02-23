import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ===== __dirname for ESM =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== uploads folder =====
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ===== Multer (file upload) =====
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ===== Email transporter (Gmail SMTP or any SMTP) =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ===== Health check =====
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Server running" });
});

app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "backend alive" });
});

// ===== Booking with photo =====
app.post("/api/book-with-photo", upload.single("photo"), async (req, res) => {
  try {
    const { service, date, time, name, email, notes } = req.body;

    if (!service || !date || !time || !name || !email) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Missing required fields." });
    }

    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ error: "OWNER_EMAIL not set in .env" });
    }

    // Email to YOU
    const ownerMail = {
      from: `"Imperail Sewing" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      subject: `New Booking — ${service} — ${date} ${time}`,
      text: `New booking request

Service: ${service}
Date: ${date}
Time: ${time}

Customer:
Name: ${name}
Email: ${email}

Notes:
${notes || "(none)"}
`,
      attachments: req.file
        ? [
            {
              filename: req.file.originalname || "dress-photo.jpg",
              path: req.file.path,
            },
          ]
        : [],
    };

    // Confirmation email to customer
    const customerMail = {
      from: `"Imperail Sewing" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking received — ${date} at ${time}`,
      text: `Hi ${name},

We received your booking request.

Service: ${service}
Date: ${date}
Time: ${time}

We will confirm your appointment shortly.

Thank you,
Imperail Sewing`,
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(customerMail);

    if (req.file) fs.unlink(req.file.path, () => {});

    res.json({ ok: true });
  } catch (err) {
    console.log("BOOK ERROR:", err);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: "Failed to send email." });
  }
});

// ===== Start server =====
const PORT = 3001;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});