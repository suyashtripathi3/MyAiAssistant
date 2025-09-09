import { DataTypes } from "sequelize";
import sequelize from "../config/mysql.js"; // MySQL connection

const Conversation = sequelize.define(
  "conversation_history",
  {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "No answer yet",
    },
  },
  {
    timestamps: true,
    tableName: "conversation_history",
  }
);

export default Conversation;
