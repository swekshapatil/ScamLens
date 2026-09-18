require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash"
});

async function analyzeWithAI(text) {

    try {

  const prompt = `
You are the AI analysis engine for ScamLens.

Analyze this message for scam risk.

Return ONLY these 2 lines:

VERDICT: [Likely Scam / Suspicious / Likely Legitimate]
REASON: [one short sentence explaining the main reason]

Keep the response under 30 words.
Do not use markdown.
Do not add greetings.
Do not add bullet points.
Do not give safety advice.

Message:
"${text}"
`;

        const result = await model.generateContent(prompt);

        const response =
            result.response.text();

        return response;

    } catch (error) {

        console.error("AI SERVICE ERROR:", error.message);

        return null;
    }
}

module.exports = {
    analyzeWithAI
};