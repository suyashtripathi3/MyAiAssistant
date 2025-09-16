// Home.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import axios from "axios";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import Footer from "./Footer";
import ConversationHistory from "../components/ConversationHistory.jsx";

const Home = () => {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    conversationHistory, // ✅ context history
    clearHistory,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // ---------- UI State ----------
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  // ✅ Context wali history hi use karenge
  const history = conversationHistory || [];

  // Fallback “open link” bar if popup blocked
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
      speak("ब्राउज़र ने नई टैब ब्लॉक कर दी है। नीचे बटन दबाकर खोलें।");
      return false;
    }
    return true;
  };

  // ---------- Central Command Handler ----------
  const handleCommand = (data, originalQueryText) => {
    if (!data) return;
    const { type, userInput, response } = data;

    if (response) {
      setAiText(response);
      speak(response);
    }

    const encode = (q) => encodeURIComponent(q || "");

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
        (async () => {
          try {
            const city = userInput;

            // Language detection: Hindi if user asks in Hindi
            const isHindi = /[^\x00-\x7F]/.test(originalQueryText); // <--- use originalQueryText
            const lang = isHindi ? "hi" : "en";

            const res = await axios.get(
              `${serverUrl}/api/weather?city=${encodeURIComponent(
                city
              )}&lang=${lang}`
            );

            const weather = res.data;

            if (weather?.response) {
              setAiText(weather.response); // UI par dikhana
              speak(weather.response); // AI voice bolna
            }
          } catch (err) {
            console.error("Weather fetch error:", err);
            const fallback = /[^\x00-\x7F]/.test(originalQueryText)
              ? "माफ़ कीजिए, मौसम जानकारी नहीं ला पाए।"
              : "Sorry, I could not fetch the weather.";
            setAiText(fallback);
            speak(fallback);
          }
        })();
        break;

        break;
      case "calculator_open":
        tryOpenOrDefer(
          "https://www.google.com/search?q=calculator",
          "Open Calculator"
        );
        break;
      case "make_call":
        tryOpenOrDefer(`tel:${userInput}`, `Call ${userInput}`);
        break;
      case "whatsapp_message":
        tryOpenOrDefer(`https://wa.me/${userInput}`, `WhatsApp ${userInput}`);
        break;
      case "open_app":
        speak(`Opening ${userInput} app on your device`);
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

  // ---------- SpeechRecognition Setup ----------
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

    // text me Hindi Unicode character check karke language detect kare
    const detectLanguage = (text) => {
      const hindiPattern = /[\u0900-\u097F]/; // Devanagari range
      return hindiPattern.test(text) ? "hi" : "en";
    };

    const handleWeather = async (transcript) => {
      const cityMatch = transcript.match(/in ([a-zA-Z\u0900-\u097F\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : "Delhi";
      const lang = detectLanguage(transcript);

      try {
        const res = await axios.get(
          `${serverUrl}/api/weather?city=${encodeURIComponent(
            city
          )}&lang=${lang}`
        );
        const weather = res.data;

        if (weather?.response) {
          setAiText(weather.response); // UI par dikhaye
          speak(weather.response); // voice bolaye
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        const fallback =
          lang === "hi"
            ? "माफ़ कीजिए, मौसम नहीं fetch कर पाया।"
            : "Sorry, I could not fetch the weather.";
        setAiText(fallback);
        speak(fallback);
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

      // activate assistant
      if (!isActiveRef.current && lower.includes(assistantName)) {
        isActiveRef.current = true;
        speak(
          `${userData?.assistantName || "Jarvis"} activated. I am listening.`
        );
        return;
      }

      // deactivate assistant
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

      // ✅ Weather command alag handle
      if (lower.includes("weather") || lower.includes("मौसम")) {
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        await handleWeather(transcript); // ye function above
        return; // normal AI response ko block kar
      }

      // normal AI conversation
      try {
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        console.log("🤖 Gemini response:", data);
        if (data?.response || data?.type) {
          handleCommand(data, transcript);
          setUserText("");
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
        {!aiText && (
          <img src={userImg} alt="" className="w-[140px] mix-blend-lighten" />
        )}
        {aiText && (
          <img src={aiImg} alt="" className="w-[140px] mix-blend-lighten" />
        )}

        {/* Bubble text */}
        <h1 className="text-white text-[18px] font-semibold text-center px-4">
          {userText ? userText : aiText ? aiText : null}
        </h1>

        {/* Desktop history with scrollbar */}
        <div className="hidden lg:block w-full max-w-[850px] mt-4 p-4 bg-[#111133]/80 backdrop-blur-md rounded-xl overflow-y-auto max-h-[300px] scrollbar-glass">
          <h2 className="text-white font-semibold text-[18px] text-center mb-2">
            Conversation History
          </h2>
          <ConversationHistory history={history} variant="desktop" />
        </div>

        {/* Popup blocked bar */}
        {pendingOpen && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white text-black rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50">
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

export default Home;
