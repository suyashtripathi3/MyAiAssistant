import Conversation from "../models/conversation.model.js";

// Save Conversation
export const saveConversation = async (req, res) => {
  try {
    const { userId, question, answer } = req.body;

    // ✅ Agar answer available hai tabhi save karo
    if (!answer) {
      return res
        .status(400)
        .json({ message: "Answer missing, not saving conversation" });
    }

    const conversation = await Conversation.create({
      userId,
      question,
      answer,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error saving conversation:", error);
    res.status(500).json({ message: "Error saving conversation" });
  }
};

// Get Conversation History
export const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Mongo query (findAll → find, order → sort)
    const history = await Conversation.find({ userId }).sort({ createdAt: 1 });

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
};

// Clear History
export const clearHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ MySQL destroy → Mongo deleteMany
    await Conversation.deleteMany({ userId });

    res.json({ success: true, message: "History cleared successfully" });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ message: "Failed to clear history" });
  }
};
