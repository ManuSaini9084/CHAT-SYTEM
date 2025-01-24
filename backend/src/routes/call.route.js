import express from "express";
import twilio from "twilio";

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

router.post("/audio-call", async (req, res) => {
  try {
    const call = await twilioClient.calls.create({
      from: "+15077347932", // Hardcoded Twilio number
      to: "+919084880935",  // Hardcoded recipient number
      url: "https://handler.twilio.com/twiml/EHa15110950917f7bf4baa8d4d713260a4", // TwiML Bin URL
    });

    res.status(200).json({ message: "Call initiated successfully", callSid: call.sid }); 
  } catch (error) {
    console.error("Twilio Call Error:", error);
    res.status(500).json({ error: "Failed to initiate call", details: error.message });
  }
});

export default router;
