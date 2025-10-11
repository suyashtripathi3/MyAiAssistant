// HomeUI.jsx
import React from "react";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { Mic, MicOff } from "lucide-react";
import Footer from "./Footer";
import ConversationHistory from "../components/ConversationHistory";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

const HomeUI = (props) => {
  const {
    userData,
    listening,
    userText,
    aiText,
    micMuted,
    ham,
    pendingOpen,
    isSpeakingRef,
    isActiveRef,
    history,
    setHam,
    setPendingOpen,
    handleMicMuteToggle,
    handleLogOut,
    navigate,
    clearHistory,
  } = props;

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] relative p-4 overflow-x-hidden scrollbar-glass">
        {/* Hamburger menu */}
        <CgMenuRight
          className="lg:hidden text-white absolute top-[20px] right-[20px] w-[28px] h-[28px] cursor-pointer"
          onClick={() => setHam(true)}
        />
        <div
          className={`absolute top-0 w-full h-full lg:hidden bg-[#0000007a] backdrop-blur-sm p-[20px] ${
            ham ? "translate-x-0" : "translate-x-full"
          } transition-transform`}
        >
          <div className="relative w-full h-full bg-[#0c0c2a] rounded-2xl p-5 overflow-hidden flex flex-col">
            <RxCross1
              className="text-white absolute top-[16px] right-[16px] w-[26px] h-[26px] cursor-pointer"
              onClick={() => setHam(false)}
            />
            <div className="flex flex-col gap-3 p-4 ">
              <button
                className="min-w-[120px] h-[48px] font-semibold bg-white rounded-full text-black text-[16px] cursor-pointer"
                onClick={handleLogOut}
              >
                Log out
              </button>
              <button
                className="min-w-[180px] h-[48px] font-semibold bg-white rounded-full text-black text-[16px] px-5 cursor-pointer"
                onClick={() => navigate("/customize")}
              >
                Customize Assistant
              </button>
              {/* <button
                className="min-w-[180px] h-[48px] font-semibold bg-white rounded-full text-black text-[16px] px-5 cursor-pointer"
                onClick={() => navigate("/generate")}
              >
                Text/Image
              </button> */}
              {/* ✅ Clear History button (Mobile menu) */}
              <button
                className="min-w-[160px] h-[48px] font-semibold bg-red-500 rounded-full text-white text-[16px] px-5 cursor-pointer"
                onClick={() => {
                  if (window.confirm("Do you really want to clear history?")) {
                    clearHistory(userData?._id);
                  }
                }}
              >
                Clear History
              </button>
            </div>

            <div className="w-full h-[2px] bg-[#2c2c5a] my-2" />
            <h2 className="text-white font-semibold text-[18px] mb-2">
              History
            </h2>

            {/* Mobile History with scrollbar */}
            <div className="lg:hidden w-full mt-4 p-3 bg-[#111133]/80 backdrop-blur-md rounded-xl max-h-[400px] overflow-y-auto scrollbar-glass">
              <h2 className="text-white font-semibold text-[16px] text-center mb-2">
                Conversation History
              </h2>
              <ConversationHistory history={history} variant="mobile" />
            </div>
          </div>
        </div>

        {/* Desktop actions */}
        <button
          className="min-w-[120px] h-[48px] font-semibold hidden lg:block absolute top-[20px] right-[20px] bg-white rounded-full text-black text-[16px] cursor-pointer"
          onClick={handleLogOut}
        >
          Log out
        </button>
        <button
          className="min-w-[180px] h-[48px] font-semibold hidden lg:block absolute top-[80px] right-[20px] bg-white rounded-full text-black text-[16px] px-5 cursor-pointer"
          onClick={() => navigate("/customize")}
        >
          Customize Assistant
        </button>
        {/* <button
          className="min-w-[180px] h-[48px] font-semibold hidden lg:block absolute top-[140px] right-[20px] bg-white rounded-full text-black text-[16px] px-5 cursor-pointer"
          onClick={() => navigate("/generate")}
        >
          Text/Image
        </button> */}
        {/* ✅ Clear History button (Desktop) */}
        <button
          className="min-w-[180px] h-[48px] font-semibold hidden lg:block absolute top-[140px] right-[20px] bg-red-500 rounded-full text-white text-[16px] px-5 cursor-pointer"
          onClick={() => {
            if (window.confirm("Do you really want to clear history?")) {
              clearHistory(userData?._id);
            }
          }}
        >
          Clear History
        </button>

        {/* Assistant display */}
        <div className="w-[300px] h-[360px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
          <img src={userData?.assistantImage} alt="" className="h-full" />
        </div>
        <h1 className="text-white text-[18px] font-semibold">
          I'm <span className="text-blue-400">{userData?.assistantName}</span>
        </h1>

        {/* Status pills */}
        <div className="flex gap-2 mb-1">
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              micMuted || isSpeakingRef.current
                ? "bg-gray-600/40 text-gray-200" // Idle only if mic muted
                : listening
                ? "bg-green-600/40 text-green-200" // Listening
                : "bg-gray-600/40 text-gray-200" // AI speaking → still Idle shown as gray
            }`}
          >
            {micMuted || isSpeakingRef.current
              ? "Idle"
              : listening
              ? "Listening…"
              : "Idle"}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs ${
              isActiveRef.current
                ? "bg-blue-600/40 text-blue-200"
                : "bg-gray-600/40 text-gray-200"
            }`}
          >
            {isActiveRef.current ? "Active" : "Say name to activate"}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              isSpeakingRef.current
                ? "bg-yellow-600/40 text-yellow-200"
                : "bg-gray-600/40 text-gray-200"
            }`}
          >
            {isSpeakingRef.current ? "Speaking…" : "Silent"}
          </span>
        </div>

        {/* Avatars */}
        {!aiText && (
          <img src={userImg} alt="" className="w-[140px] mix-blend-lighten" />
        )}
        {aiText && (
          <img src={aiImg} alt="" className="w-[140px] mix-blend-lighten" />
        )}

        {/* 🎤 Mic Button Center */}
        <div className="mt-4">
          <button
            onClick={handleMicMuteToggle}
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-colors
${micMuted ? "bg-red-600" : "bg-green-600"} text-white`}
            title={micMuted ? "Mic is muted" : "Mic is active"}
          >
            {micMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
        </div>

        {/* Bubble text */}
        {(userText || aiText) && (
          <div className="max-w-[600px] bg-[#22225a] text-white px-4 py-2 rounded-2xl shadow-md text-center mt-2">
            {userText || aiText}
          </div>
        )}

        {/* Desktop history with scrollbar */}
        <div className="hidden lg:block w-full max-w-[850px] mt-4 p-4 bg-[#111133]/80 backdrop-blur-md rounded-xl overflow-y-auto max-h-[300px] scrollbar-glass">
          <h2 className="text-white font-semibold text-[18px] text-center mb-2">
            Conversation History
          </h2>
          <ConversationHistory history={history} variant="desktop" />
        </div>

        {/* Popup blocked bar */}
        {pendingOpen && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-black rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50 transition-all duration-300 animate-bounce">
            <span className="text-sm">
              Pop-up blocked. Click to open:&nbsp;
              <span className="font-semibold">{pendingOpen.label}</span>
            </span>
            <button
              className="bg-black text-white px-3 py-1 rounded-full text-sm "
              onClick={() => {
                window.open(pendingOpen.url, "_blank");
                setPendingOpen(null);
              }}
            >
              Open
            </button>
            <button
              className="px-2 text-sm"
              onClick={() => setPendingOpen(null)}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default HomeUI;
