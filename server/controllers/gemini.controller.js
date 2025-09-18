// // controllers/gemini.controller.js
// import { geminiTextGeneration } from "../gemini.js";

// // ---------- Text Generation ----------
// export const handleTextGeneration = async (req, res) => {
//   try {
//     const { prompt } = req.body;
//     if (!prompt)
//       return res
//         .status(400)
//         .json({ success: false, message: "Prompt is required" });

//     const text = await geminiTextGeneration(prompt);
//     res.json({ success: true, text });
//   } catch (err) {
//     console.error("❌ Text generation error:", err.message);
//     res.status(500).json({ success: false, message: "Text generation failed" });
//   }
// };

// // ---------- Image Generation ----------
// // export const handleImageGeneration = async (req, res) => {
// //   try {
// //     const { prompt } = req.body;
// //     console.log("📝 Prompt received:", prompt); // ✅ Debug: check prompt
// //     console.log("🗝️ API Key:", process.env.API_KEY ? "OK" : "Missing"); // ✅ Debug: check API key

// //     if (!prompt)
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Prompt is required" });

// //     const image = await geminiImageGeneration(prompt);
// //     console.log("✅ Image generated successfully"); // ✅ Debug: check if function returned
// //     res.json({ success: true, image });
// //   } catch (err) {
// //     console.error(
// //       "❌ Controller Image Error:",
// //       err.response?.data || err.message
// //     ); // ✅ Debug: full error details
// //     res
// //       .status(500)
// //       .json({ success: false, message: "Image generation failed" });
// //   }
// // };
