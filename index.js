import dotenv from "dotenv";
dotenv.config();

if (!process.env.RESEND_API_KEY) {
    console.error("No API key found in env!");
} else {
    console.log("API key loaded successfully");
}




import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json());

// ----- RESEND SETUP -----
const resend = new Resend(process.env.RESEND_API_KEY);


// ----- CONTACT FORM ENDPOINT -----
app.post("/contact", async (req, res) => {
    const { name, email, phone, message } = req.body;

    // ----- VALIDATION / ANTI-SPAM -----
    const nameRegex = /^[a-zA-Z\s'.-]{2,40}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-()\s]{7,20}$/;
    const messageRegex = /^(?!.*https?)(?!.*<script>)(?!.*www\.).{5,800}$/;

    if (!nameRegex.test(name))
        return res.json({ status: "error", msg: "Invalid name." });

    if (!emailRegex.test(email))
        return res.json({ status: "error", msg: "Invalid email." });

    if (!phoneRegex.test(phone))
        return res.json({ status: "error", msg: "Invalid phone number." });

    if (!messageRegex.test(message))
        return res.json({ status: "error", msg: "Message rejected (spam detected)." });

    // ----- SEND EMAIL USING RESEND -----
    try {
        const data = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: "delivered@resend.dev",
            subject: `New Contact Form Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
            `
        });

        return res.json({ status: "success", data });
    } catch (err) {
        return res.json({ status: "error", error: err });
    }
});

// ----- START SERVER -----
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

console.log(process.env.RESEND_API_KEY);
console.log("Hello World");