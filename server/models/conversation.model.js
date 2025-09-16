import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // User model se link
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
      default: "No answer yet",
    },
  },
  { timestamps: true, collection: "conversation_history" } // same mysql table name
);

const Conversation = mongoose.model("conversation_history", conversationSchema);

export default Conversation;
