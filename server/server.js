import express from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();

// ✅ Change this if your frontend runs on another port
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// ---------- Uploads ----------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({ dest: uploadsDir });

// ---------- Health Check ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is healthy ✅" });
});
app.get("/", (req, res) => {
  res.send("OK ✅ Imperial Sewing API is running");
});

// ---------- Booking API ----------
app.post("/api/book-with-photo", upload.single("photo"), async (req, res) => {
  try {
    // ✅ Required envs
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!OWNER_EMAIL) return res.status(500).json({ error: "OWNER_EMAIL not set in .env" });
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: "SMTP config not set in .env" });
    }

    // ✅ Form data
    const { service, date, time, name, email, message } = req.body;

    if (!service || !date || !time || !name || !email) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ✅ Mail transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = SSL
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // ✅ Emails
    const ownerMail = {
      from: `Booking <${SMTP_USER}>`,
      to: OWNER_EMAIL,
      subject: `📌 New Booking - ${service}`,
      text:
        `New booking received:\n\n` +
        `Service: ${service}\n` +
        `Date: ${date}\n` +
        `Time: ${time}\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Message: ${message || "(none)"}\n`,
      attachments: req.file
        ? [{ filename: req.file.originalname, path: req.file.path }]
        : [],
    };

    const customerMail = {
      from: `Imperial Sewing <${SMTP_USER}>`,
      to: email,
      subject: `✅ Booking received - ${service}`,
      text:
        `Hi ${name},\n\n` +
        `We received your booking!\n\n` +
        `Service: ${service}\n` +
        `Date: ${date}\n` +
        `Time: ${time}\n\n` +
        `We will contact you soon.\n\n` +
        `Thanks,\nImperial Sewing`,
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(customerMail);

    // ✅ remove uploaded file from server after sending
    if (req.file) fs.unlink(req.file.path, () => {});

    return res.json({ ok: true });
  } catch (err) {
    console.log("BOOK ERROR:", err);
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: "Failed to send email." });
  }
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});