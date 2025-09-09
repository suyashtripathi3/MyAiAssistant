// Home.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import axios from "axios";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    conversationHistory: ctxHistory = [],
    setConversationHistory,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // ---------- UI State ----------
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const [history, setHistory] = useState(() => {
    const seed = ctxHistory?.length
      ? ctxHistory
      : userData?.history?.map((q) => ({ question: q, answer: "" })) || [];
    return Array.isArray(seed) ? seed : [];
  });

  const [pendingOpen, setPendingOpen] = useState(null);

  // ---------- Speech & Recognition Refs ----------
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isActiveRef = useRef(false);

  const synth = window.speechSynthesis;

  // ---------- Logout ----------
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setUserData(null);
      navigate("/signin");
    }
  };

  // ---------- Helpers ----------
  const startRecognition = () => {
    if (!recognitionRef.current) return;
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current.start();
        isRecognizingRef.current = true;
        setListening(true);
        console.log("🎤 Recognition started");
      } catch (error) {
        if (error?.name !== "InvalidStateError") {
          console.error("Recognition start error:", error);
        }
      }
    }
  };

  const pickHindiVoice = () => {
    const voices = synth.getVoices?.() || [];
    const exactHi = voices.find((v) => v.lang === "hi-IN");
    if (exactHi) return exactHi;
    return (
      voices.find((v) => /-IN$/i.test(v.lang)) ||
      voices.find((v) => /en-GB|en-IN|en-US/i.test(v.lang)) ||
      null
    );
  };

  const speak = (text) => {
    if (!text) return;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "hi-IN";
    const v = pickHindiVoice();
    if (v) utter.voice = v;

    utter.onstart = () => {
      isSpeakingRef.current = true;
      try {
        recognitionRef.current?.stop();
      } catch {}
    };

    utter.onend = () => {
      isSpeakingRef.current = false;
      setAiText("");
      setTimeout(() => startRecognition(), 350);
    };

    synth.speak(utter);
  };

  const tryOpenOrDefer = (url, label = "Open Link") => {
    let win = null;
    try {
      win = window.open(url, "_blank");
    } catch (e) {
      win = null;
    }
    if (!win || win.closed || typeof win.closed === "undefined") {
      console.warn("⚠️ Pop-up blocked. Showing fallback button.");
      setPendingOpen({ url, label });
      speak(
        "आपके ब्राउज़र ने नई टैब ब्लॉक कर दी है। नीचे दिख रहे बटन पर क्लिक करके लिंक खोलें।"
      );
      return false;
    }
    return true;
  };

  // ---------- Centralized command handler ----------
  const handleCommand = (data, originalQueryText) => {
    if (!data) return;

    const { type, userInput, response } = data;

    if (response) {
      setAiText(response);
      speak(response);
    }

    setHistory((prev) => [
      ...prev,
      {
        question: originalQueryText || userInput || "",
        answer: response || "",
        timestamp: Date.now(),
      },
    ]);

    const encode = (q) => encodeURIComponent(q || "");

    // ---------- External action handling ----------
    switch (type) {
      case "youtube_open":
        tryOpenOrDefer("https://www.youtube.com", "Open YouTube");
        break;

      case "youtube_search":
      case "youtube_play":
        tryOpenOrDefer(
          `https://www.youtube.com/results?search_query=${encode(userInput)}`,
          "Open YouTube Search"
        );
        break;

      case "google_search":
        tryOpenOrDefer(
          `https://www.google.com/search?q=${encode(userInput)}`,
          "Open Google Search"
        );
        break;

      case "instagram_open":
        tryOpenOrDefer("https://www.instagram.com/", "Open Instagram");
        break;

      case "facebook_open":
        tryOpenOrDefer("https://www.facebook.com/", "Open Facebook");
        break;

      case "weather_show":
        tryOpenOrDefer(
          "https://www.google.com/search?q=weather",
          "Open Weather"
        );
        break;

      case "calculator_open":
        tryOpenOrDefer(
          "https://www.google.com/search?q=calculator",
          "Open Calculator"
        );
        break;

      // ---------- New mobile commands ----------
      case "make_call":
        tryOpenOrDefer(`tel:${userInput}`, `Call ${userInput}`);
        break;

      case "whatsapp_message":
        // userInput should be number in international format without '+' (e.g., 919876543210)
        tryOpenOrDefer(`https://wa.me/${userInput}`, `WhatsApp ${userInput}`);
        break;

      case "open_app":
        speak(`Opening ${userInput} app on your device`);
        // real app opening is limited to PWAs or links, no universal way from browser
        break;

      case "open_website":
        tryOpenOrDefer(
          userInput.startsWith("http") ? userInput : `https://${userInput}`,
          `Open ${userInput}`
        );
        break;

      default:
        console.log("👉 No external action, only response shown.");
        break;
    }
  };

  // ---------- Effect: Setup SpeechRecognition ----------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Web Speech API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let mounted = true;

    recognition.onstart = () => {
      if (!mounted) return;
      isRecognizingRef.current = true;
      setListening(true);
      console.log("🎙️ onstart");
    };

    recognition.onend = () => {
      if (!mounted) return;
      isRecognizingRef.current = false;
      setListening(false);
      console.log("🎙️ onend");
      if (!isSpeakingRef.current) {
        setTimeout(() => startRecognition(), 700);
      }
    };

    recognition.onerror = (e) => {
      if (!mounted) return;
      console.warn("🎙️ onerror:", e?.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (e?.error !== "aborted") {
        setTimeout(() => startRecognition(), 900);
      }
    };

    recognition.onresult = async (e) => {
      const result = e.results[e.results.length - 1][0];
      const transcript = (result?.transcript || "").trim();
      if (!transcript) return;

      console.log("📝 Heard:", transcript);
      setUserText(transcript);
      setAiText("");

      const lower = transcript.toLowerCase();
      const assistantName = (userData?.assistantName || "Jarvis").toLowerCase();

      if (!isActiveRef.current && lower.includes(assistantName)) {
        isActiveRef.current = true;
        speak(
          `${userData?.assistantName || "Jarvis"} activated. I am listening.`
        );
        return;
      }

      if (
        isActiveRef.current &&
        (lower.includes(`deactivate ${assistantName}`) ||
          lower.includes(`stop ${assistantName}`) ||
          lower.includes("deactivate") ||
          lower.includes("stop"))
      ) {
        isActiveRef.current = false;
        speak(
          `${
            userData?.assistantName || "Jarvis"
          } deactivated. Say my name to activate me again.`
        );
        return;
      }

      if (!isActiveRef.current) return;

      try {
        try {
          recognition.stop();
          isRecognizingRef.current = false;
          setListening(false);
        } catch {}

        const data = await getGeminiResponse(transcript);
        console.log("🤖 Gemini response:", data);
        if (data?.response || data?.type) {
          handleCommand(data, transcript);
          setUserText("");
        } else {
          setHistory((prev) => [
            ...prev,
            { question: transcript, answer: "", timestamp: Date.now() },
          ]);
        }
      } catch (err) {
        console.error("Gemini call failed:", err);
        speak("माफ़ कीजिए, कोई समस्या आ गई। कृपया दोबारा बोलें।");
      } finally {
        setTimeout(() => startRecognition(), 600);
      }
    };

    if (synth && typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = () => {
        pickHindiVoice();
      };
    }

    setTimeout(() => {
      speak(
        `Hello ${userData?.name || "User"}, say ${
          userData?.assistantName || "Jarvis"
        } to activate me.`
      );
    }, 800);

    setTimeout(() => startRecognition(), 1600);

    return () => {
      mounted = false;
      try {
        recognition.stop();
      } catch {}
      setListening(false);
      isRecognizingRef.current = false;
      isSpeakingRef.current = false;
      if (synth) synth.onvoiceschanged = null;
    };
  }, []);

  // ---------- Render ----------
  return (
    <div className="w-full min-h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] relative p-4">
      {/* Mobile hamburger */}
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
          <div className="flex gap-3 mb-4">
            <button
              className="min-w-[120px] h-[48px] font-semibold bg-white rounded-full text-black text-[16px]"
              onClick={handleLogOut}
            >
              Log out
            </button>
            <button
              className="min-w-[180px] h-[48px] font-semibold bg-white rounded-full text-black text-[16px] px-5"
              onClick={() => navigate("/customize")}
            >
              Customize Assistant
            </button>
          </div>

          <div className="w-full h-[2px] bg-[#2c2c5a] my-2" />
          <h2 className="text-white font-semibold text-[18px] mb-2">History</h2>

          <div className="w-full flex-1 overflow-auto pr-1">
            {history.length === 0 && (
              <p className="text-gray-300">No conversation yet.</p>
            )}
            {history.map((item, idx) => (
              <div key={idx} className="mb-3">
                <p className="text-blue-400 font-semibold">
                  Q: {item.question}
                </p>
                {item.answer ? (
                  <p className="text-white">A: {item.answer}</p>
                ) : (
                  <p className="text-gray-300 italic">A: —</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop quick actions */}
      <button
        className="min-w-[120px] h-[48px] font-semibold hidden lg:block absolute top-[20px] right-[20px] bg-white rounded-full text-black text-[16px]"
        onClick={handleLogOut}
      >
        Log out
      </button>
      <button
        className="min-w-[180px] h-[48px] font-semibold hidden lg:block absolute top-[80px] right-[20px] bg-white rounded-full text-black text-[16px] px-5"
        onClick={() => navigate("/customize")}
      >
        Customize Assistant
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
            listening
              ? "bg-green-600/40 text-green-200"
              : "bg-gray-600/40 text-gray-200"
          }`}
        >
          {listening ? "Listening…" : "Idle"}
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
      </div>

      {/* Avatars */}
      {!aiText && <img src={userImg} alt="" className="w-[140px]" />}
      {aiText && <img src={aiImg} alt="" className="w-[140px]" />}

      {/* Bubble text */}
      <h1 className="text-white text-[18px] font-semibold text-center px-4">
        {userText ? userText : aiText ? aiText : null}
      </h1>

      {/* Desktop conversation box */}
      <div className="hidden lg:block w-full max-w-[700px] mt-4 p-4 bg-[#111133] rounded-xl overflow-y-auto max-h-[240px]">
        <h2 className="text-white font-semibold text-[18px] text-center mb-2">
          Conversation History
        </h2>
        {history.length === 0 && (
          <p className="text-gray-300 text-center">No conversation yet.</p>
        )}
        {history.map((item, idx) => (
          <div key={idx} className="mb-2">
            <p className="text-blue-400 font-semibold">Q: {item.question}</p>
            {item.answer ? (
              <p className="text-white">A: {item.answer}</p>
            ) : (
              <p className="text-gray-300 italic">A: —</p>
            )}
          </div>
        ))}
      </div>

      {/* Fallback open link bar */}
      {pendingOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-black rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50">
          <span className="text-sm">
            Pop-up blocked. Click to open:&nbsp;
            <span className="font-semibold">{pendingOpen.label}</span>
          </span>
          <button
            className="bg-black text-white px-3 py-1 rounded-full text-sm"
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
  );
};

export default Home;
