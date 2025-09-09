import Conversation from "../models/conversation.model.js";

// saveConversation
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
    console.error(error);
    res.status(500).json({ message: "Error saving conversation" });
  }
};

export const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Conversation.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching history" });
  }
};

// historyController.js
// conversation.controller.js
export const clearHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    await Conversation.destroy({ where: { userId } });
    res.json({ success: true, message: "History cleared successfully" });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ message: "Failed to clear history" });
  }
};
