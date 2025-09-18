import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

// -------- Assistant JSON Response --------
const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const prompt = `
You are a highly intelligent, voice-enabled virtual assistant named ${assistantName}, created by ${userName}.
You can understand Hindi, English, and Hinglish, and respond naturally in a voice-friendly way.

Always respond **strictly in JSON** with this structure:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
           "get_time" | "get_date" | "get_day" | "get_month" |
           "calculator_open" | "instagram_open" | "facebook_open" |
           "whatsapp_message" | "make_call" | "open_app" | "open_website" |
           "weather_show",
  "userInput": "<cleaned actionable user query: search terms, contact names, app/website name, song/video name>",
  "response": "<short, polite, voice-friendly reply>"
}

📌 Type meanings:
- "general": factual/informational question. Example: "Who is Elon Musk? and Detect user input language (Hindi / English / Hinglish).
Reply in the same language with a natural human-like tone and "mera note save kar" → DB me save, "mera reminder set kar" → cron job ya scheduler me set.
"
- "google_search": search on Google. Example: "Search AI news on Google"
- "youtube_search": search videos on YouTube. Example: "Find cute cat videos on YouTube"
- "youtube_play": directly play a video/song. Example: "Play Believer by Imagine Dragons" → userInput: "Believer by Imagine Dragons"
- "calculator_open": open calculator
- "instagram_open": open Instagram
- "facebook_open": open Facebook
- "weather_show": show weather
- "get_time": current time
- "get_date": today’s date
- "get_day": today’s day
- "get_month": current month
- "make_call": call someone → include contact in userInput
- "whatsapp_message": send WhatsApp message → include contact + message in userInput
- "open_app": open mobile app → include app name
- "open_website": open website → include URL or site name

⚡ Rules:
1. Always respond **only in JSON**, no extra text.
2. "response" must be **short, polite, and voice-friendly**, 1-2 sentences max.
3. Remove your own name from userInput; keep only actionable content.
4. For searches, include only search text in userInput.
5. For calls/messages, include contact name and message in userInput.
6. For apps/websites, include only cleaned app/site name.
7. For songs/videos, use "youtube_play" and include song/video name in userInput.
8. Detect mixed Hindi+English naturally.
9. If unsure, fallback to "general".
10. Be helpful, polite, engaging, and concise.

📌 Examples:

User: "Hey ${assistantName}, play Believer by Imagine Dragons"  
Output: {
  "type": "youtube_play",
  "userInput": "Believer by Imagine Dragons",
  "response": "Playing 'Believer' on YouTube."
}

User: "Play Naatu Naatu song"  
Output: {
  "type": "youtube_play",
  "userInput": "Naatu Naatu",
  "response": "Playing 'Naatu Naatu' on YouTube."
}

User: "Call John"  
Output: {
  "type": "make_call",
  "userInput": "John",
  "response": "Calling John now."
}

User: "Send WhatsApp message to Priya: Hello, are you free?"  
Output: {
  "type": "whatsapp_message",
  "userInput": "Priya: Hello, are you free?",
  "response": "Sending your message to Priya."
}

User: "Search best AI news"  
Output: {
  "type": "google_search",
  "userInput": "best AI news",
  "response": "Here are the latest AI news results."
}

User: "${command}"  
Output:
`;

    const result = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(error);
  }
};

// -------- Normal Text Generation --------
// export const geminiTextGeneration = async (prompt) => {
//   try {
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

//     const result = await axios.post(apiUrl, {
//       contents: [{ parts: [{ text: prompt }] }],
//     });

//     return result.data.candidates[0].content.parts[0].text;
//   } catch (error) {
//     console.log(error);
//   }
// };

// -------- Image Generation --------
// import axios from "axios";

// export const geminiImageGeneration = async (prompt) => {
//   try {
//     console.log("🌟 Calling Gemini image API with prompt:", prompt); // ✅ Debug
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/images:generate?key=${process.env.API_KEY}`;

//     const response = await axios.post(apiUrl, {
//       prompt: prompt,
//       size: "1024x1024",
//     });

//     console.log("🌈 Gemini API response data:", response.data); // ✅ Debug: see full API response
//     const base64Image = response.data.data[0].b64_json;
//     return `data:image/png;base64,${base64Image}`;
//   } catch (error) {
//     console.error(
//       "❌ Gemini Image Error:",
//       error.response?.data || error.message
//     ); // ✅ Debug: full error
//     throw new Error("Image generation failed");
//   }
// };

export default geminiResponse;
