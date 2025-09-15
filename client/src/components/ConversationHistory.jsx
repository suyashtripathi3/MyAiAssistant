import { groupConversations } from "../utils/groupConversations";

export default function ConversationHistory({ history, variant = "desktop" }) {
  const grouped = groupConversations(history);

  if (!history?.length) {
    return <p className="text-gray-300 text-center">No conversation yet.</p>;
  }

  const questionStyle =
    variant === "mobile"
      ? "text-blue-400 font-semibold text-sm"
      : "text-blue-400 font-semibold";

  const answerStyle =
    variant === "mobile" ? "text-white text-sm" : "text-white";

  return (
    <div className="w-full flex-1 overflow-auto pr-1 scrollbar-glass">
      {Object.entries(grouped).map(([dateKey, items]) => (
        <div key={dateKey} className="mb-4">
          {/* Date heading */}
          <h3 className="text-gray-300 text-xs font-medium text-center mb-2">
            {dateKey}
          </h3>

          {items.map((item, i) => (
            <div key={i} className="mb-3">
              {/* Q + time */}
              <div className="flex justify-between items-center">
                <p className={questionStyle}>Q: {item.question}</p>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  🕒 {item.time}{" "}
                  <span className="uppercase">{item.meridiem}</span>
                </span>
              </div>

              {/* A */}
              {item.answer ? (
                <p className={answerStyle}>A: {item.answer}</p>
              ) : (
                <p className="text-gray-300 italic text-sm">A: —</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
