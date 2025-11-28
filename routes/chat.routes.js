const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        systemInstruction: {
          role: "system",
          parts: [{
            text: `
You are “EduGuide AI”, an intelligent educational assistant inside a Student Information System.

Your tasks:
- Guide students academically
- Explain concepts
- Answer college-related queries
- Help with career, placements, courses
- Provide structured suggestions
- Be friendly and supportive
          `}]
        }
      }
    );

    const aiReply = response.data.candidates[0].content.parts[0].text;

    res.json({ success: true, reply: aiReply });

  } catch (err) {
    console.log("Gemini Error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      reply: "AI server error"
    });
  }
});

module.exports = router;