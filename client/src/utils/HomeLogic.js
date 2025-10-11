// HomeLogic.js
import { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // ✅ Import react-hot-toast

export const useHomeLogic = () => {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    conversationHistory,
    clearHistory,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  // ---------- State ----------
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);
  const [micMuted, setMicMuted] = useState(true);
  const [pendingOpen, setPendingOpen] = useState(null);

  const history = conversationHistory || [];

  // ---------- Refs ----------
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isActiveRef = useRef(false);
  const micMutedRef = useRef(true);
  const synth = window.speechSynthesis;

  // ---------- Logout ----------
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out successfully!"); // ✅ toast message
    } catch (err) {
      console.log(err);
      toast.error("Logout failed!");
    } finally {
      setUserData(null);
      navigate("/signin");
    }
  };

  // ---------- Mic ----------
  const handleMicMuteToggle = () => {
    setMicMuted((prev) => {
      micMutedRef.current = !prev;
      toast(micMutedRef.current ? "Mic muted 🔇" : "Mic unmuted 🎤", {
        icon: micMutedRef.current ? "🔇" : "🎤",
      });
      return !prev;
    });
  };

  const startRecognition = () => {
    if (!recognitionRef.current || micMutedRef.current) return;
    if (isRecognizingRef.current) return;
    try {
      recognitionRef.current.start();
      isRecognizingRef.current = true;
      setListening(true);
    } catch (error) {
      if (error?.name !== "InvalidStateError") {
        console.error(error);
        toast.error("Speech recognition failed!");
      }
    }
  };

  // ---------- Voice ----------
  const pickHindiVoice = () => {
    const voices = synth.getVoices() || [];
    const hiVoice = voices.find((v) => v.lang === "hi-IN");
    return hiVoice || voices[0] || null;
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
      if (recognitionRef.current && isRecognizingRef.current) {
        recognitionRef.current.stop();
      }
      isRecognizingRef.current = false;
      setListening(false);
      toast("AI is speaking... 🗣️", { icon: "🗣️" });
    };

    utter.onend = () => {
      isSpeakingRef.current = false;
      setAiText("");
      if (!micMutedRef.current) startRecognition();
    };

    synth.speak(utter);
  };

  // ---------- Popup Helper ----------
  const tryOpenOrDefer = (url, label = "Open Link") => {
    let win = null;
    try {
      win = window.open(url, "_blank");
    } catch {
      win = null;
    }
    if (!win || win.closed || typeof win.closed === "undefined") {
      setPendingOpen({ url, label });
      toast("Popup blocked! Click the button to open.", { icon: "⚠️" });
      speak("ब्राउज़र ने नई टैब ब्लॉक कर दी है। नीचे बटन दबाकर खोलें।");
      return false;
    }
    toast.success(`${label} opened successfully!`);
    return true;
  };

  // ---------- AI Command Handler ----------
  const handleCommand = (data, originalQueryText) => {
    if (!data) return;
    const { type, userInput, response } = data;

    if (response) {
      setAiText(response);
      speak(response);
      toast(response, { icon: "🤖" });
    }

    const encode = (q) => encodeURIComponent(q || "");
    switch (type) {
      case "youtube_open":
        tryOpenOrDefer("https://www.youtube.com", "YouTube");
        break;
      case "google_search":
        tryOpenOrDefer(
          `https://www.google.com/search?q=${encode(userInput)}`,
          "Google Search"
        );
        break;
      case "weather_show":
        (async () => {
          try {
            const isHindi = /[^\x00-\x7F]/.test(originalQueryText);
            const lang = isHindi ? "hi" : "en";
            const res = await axios.get(
              `${serverUrl}/api/weather?city=${encodeURIComponent(
                userInput
              )}&lang=${lang}`
            );
            if (res.data?.response) {
              setAiText(res.data.response);
              speak(res.data.response);
              toast.success("Weather info fetched! 🌤️");
            }
          } catch {
            toast.error("Weather info fetch failed! ❌");
            speak("माफ़ कीजिए, मौसम जानकारी नहीं ला पाए।");
          }
        })();
        break;
      default:
        break;
    }
  };

  // ---------- Speech Recognition Setup ----------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = async (e) => {
      const result = e.results[e.results.length - 1][0];
      const transcript = (result?.transcript || "").trim();
      if (!transcript) return;

      setUserText(transcript);
      const lower = transcript.toLowerCase();
      const assistantName = (userData?.assistantName || "Jarvis").toLowerCase();

      if (!isActiveRef.current && lower.includes(assistantName)) {
        isActiveRef.current = true;
        speak(`${userData?.assistantName || "Jarvis"} activated.`);
        toast.success("Assistant activated! ✅");
        return;
      }

      if (!isActiveRef.current) return;

      try {
        recognition.stop();
        const data = await getGeminiResponse(transcript);
        handleCommand(data, transcript);
        setUserText("");
      } catch (err) {
        toast.error("AI response failed!");
        speak("माफ़ कीजिए, कोई समस्या आ गई।");
      } finally {
        setTimeout(() => startRecognition(), 800);
      }
    };

    setTimeout(() => startRecognition(), 200);
    setTimeout(() => {
      speak(
        `Hello ${userData?.name || "User"}, say ${
          userData?.assistantName || "Jarvis"
        } to activate me.`
      );
    }, 800);

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, []);

  // ---------- Mic toggle effect ----------
  useEffect(() => {
    if (!micMuted) {
      if (!isSpeakingRef.current) startRecognition();
    } else {
      if (recognitionRef.current && isRecognizingRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
    }
  }, [micMuted]);

  return {
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
  };
};
