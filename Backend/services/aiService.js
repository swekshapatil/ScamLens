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
You are the AI classification engine for ScamLens.

Analyze the user's message and classify it based on its overall meaning and intent.

Choose EXACTLY ONE category from these options:

1. Banking / Phishing Scam
2. Job / Internship Scam
3. Prize / Lottery Scam
4. Account Takeover / Phishing
5. Payment Scam
6. General Suspicious Activity

Choose the category that best represents the MAIN purpose of the message.

Important:
- Do not choose a category only because one keyword appears.
- Consider the entire message and its context.
- A job or internship offer requiring money belongs to Job / Internship Scam.
- A prize, lottery, reward, or winning message belongs to Prize / Lottery Scam.
- Fake bank/KYC/account verification messages belong to Banking / Phishing Scam.
- Fake login or account access messages belong to Account Takeover / Phishing.
- Payment, UPI, transfer, or refund-related scams belong to Payment Scam.
- If none clearly applies, use General Suspicious Activity.

Also classify the overall risk.

Return ONLY these 3 lines:

CATEGORY: [one exact category from the list above]
VERDICT: [Likely Scam / Suspicious / Likely Legitimate]
REASON: [one short sentence explaining the main reason]

Keep the response under 50 words.
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

        console.error(
            "AI SERVICE ERROR:",
            error.message
        );

        return null;
    }
}

module.exports = {
    analyzeWithAI
};