import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  // const serverUrl = "http://localhost:8080";
  const serverUrl = "https://myaiassistantbackend.onrender.com";
  const [userData, setUserData] = useState(null);

  // Conversation history from MySQL
  const [conversationHistory, setConversationHistory] = useState([]);

  // Images
  const [selectedImage, setSelectedImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  // Fetch conversation history for a user from MySQL
  const fetchConversationHistory = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${serverUrl}/api/conversations/${userId}`);
      setConversationHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  // Get current logged-in user
  const handleCurrentUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });

      setUserData(res.data);

      if (res.data?._id) {
        await fetchConversationHistory(res.data._id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Get AI response and (conditionally) save conversation
  const getGeminiResponse = async (command, userId = null) => {
    // Language detection
    const isHindi = /[^\x00-\x7F]/.test(command); // simple check
    const lang = isHindi ? "hi" : "en";
    try {
      const res = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );

      const aiResponse = res.data;
      const uid = userId || userData?._id;

      // ✅ Weather_show case → save mat karo DB me
      if (uid && aiResponse?.reply && aiResponse?.type !== "weather_show") {
        const savedConversation = {
          userId: uid,
          question: command,
          answer: aiResponse.reply,
        };

        // Save to backend (MySQL)
        await axios.post(
          `${serverUrl}/api/conversations/save`,
          savedConversation
        );

        // Update context state (avoid duplication)
        setConversationHistory((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].question === command &&
            prev[prev.length - 1].answer === aiResponse.reply
          ) {
            return prev; // skip duplicate
          }
          return [...prev, savedConversation];
        });
      }

      return aiResponse;
    } catch (error) {
      console.error("Error in getGeminiResponse:", error);
    }
  };

  // ✅ Clear history function
  const clearHistory = async (userId) => {
    if (!userId) return;
    const confirmDelete = window.confirm("Do you want to delete all history?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${serverUrl}/api/conversations/${userId}`);
      setConversationHistory([]); // Frontend clear
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // On mount, fetch current user and their history
  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    conversationHistory,
    setConversationHistory,
    fetchConversationHistory,
    getGeminiResponse,
    clearHistory, // ✅ exposed

    // Image states
    selectedImage,
    setSelectedImage,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
