// src/utils/chatUtils.js

// Grouping ke liye date format
export const formatDateGroup = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
  }
};

// Time show karne ke liye
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Conversations ko group karne ke liye
export const groupConversationsByDate = (conversations) => {
  return conversations.reduce((groups, chat) => {
    const group = formatDateGroup(chat.createdAt || new Date());
    if (!groups[group]) groups[group] = [];
    groups[group].push(chat);
    return groups;
  }, {});
};
