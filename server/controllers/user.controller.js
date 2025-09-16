import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment/moment.js";
import Conversation from "../models/conversation.model.js"; // ✅ import

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "update assistant error" });
  }
};
// 

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ response: "User not found" });
    }

    const userName = user.name;
    const assistantName = user.assistantName;

    // ✅ Fetch previous conversation from Mongo
    const history = await Conversation.find({ userId }).sort({ createdAt: 1 });

    const context = history
      .map((h) => `Q: ${h.question}\nA: ${h.answer}`)
      .join("\n");

    const fullPrompt = context + `\nQ: ${command}\nA:`;

    const result = await geminiResponse(fullPrompt, assistantName, userName);

    const jsonMatch = result.match(/{[\s\S]*}/);

    let aiReply = "Sorry, I can't understand.";
    let type = "general";
    let userInput = command;

    if (jsonMatch) {
      const gemResult = JSON.parse(jsonMatch[0]);
      type = gemResult.type || "general";
      userInput = gemResult.userInput || command;

      switch (type) {
        case "get_date":
          aiReply = `Current date is ${moment().format("YYYY-MM-DD")}`;
          break;

        case "get_time":
          aiReply = `Current time is ${moment().format("hh:mm A")}`;
          break;

        case "get_day":
          aiReply = `Today is ${moment().format("dddd")}`;
          break;

        case "get_month":
          aiReply = `This month is ${moment().format("MMMM")}`;
          break;

        // 📞 Call someone
        case "make_call":
          aiReply = `Calling ${userInput}...`;
          break;

        // 💬 WhatsApp message
        case "whatsapp_message":
          aiReply = `Sending WhatsApp message: "${userInput}"`;
          break;

        // 📱 Open App
        case "open_app":
          aiReply = `Opening ${userInput} app...`;
          break;

        // 🌍 Open Website
        case "open_website":
          aiReply = `Opening website: ${userInput}`;
          break;

        // ✅ General or others
        default:
          aiReply = gemResult.response || "I didn't understand that command";
      }
    }

    // ✅ Save conversation in Mongo
    await Conversation.create({
      userId,
      question: command,
      answer: aiReply,
    });

    // ⚡ Send type + userInput bhi frontend ko
    return res.json({ type, userInput, response: aiReply });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ response: "ask assistant error" });
  }
};
