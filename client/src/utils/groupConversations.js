// utils/groupConversations.js
export function groupConversations(history = []) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return [...history].reverse().reduce((acc, item) => {
    let dateStr = item.createdAt?.replace(" ", "T");
    const date = new Date(dateStr);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // ✅ Time aur meridiem alag nikal rahe hain
    const hoursMinutes = date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const [time, meridiem] = hoursMinutes.split(" ");

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({
      ...item,
      time,
      meridiem: meridiem?.toUpperCase() || "",
    });
    return acc;
  }, {});
}
