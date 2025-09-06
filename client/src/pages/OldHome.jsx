import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error: ", error);
      }
    }
  };

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    utterence.onend = () => {
      isSpeakingRef.current = false;
      startRecognition();
    };

    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    if (!data) {
      console.error("handleCommand: No data received");
      return;
    }

    const { type, userInput, response } = data;
    speak(response);

    if (type === "google_search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "youtube_search") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }

    if (type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }

    if (type === "general") {
      // Already spoken by speak()
    }

    if (type === "calculator_open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }

    if (type === "instagram_open") {
      window.open("https://www.instagram.com/", "_blank");
    }

    if (type === "facebook_open") {
      window.open("https://www.facebook.com/", "_blank");
    }

    if (type === "weather_show") {
      window.open("https://www.google.com/search?q=weather", "_blank");
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-us";

    recognitionRef.current = recognition;

    const isRecognizingRef = { current: false };
    const safeRecognizing = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition request to start");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("Start error: ", error);
          }
        }
      }
    };

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
    };

    if (!isSpeakingRef.current) {
      setTimeout(() => {
        safeRecognizing();
      }, 1000);
    }

    recognition.onerror = (e) => {
      console.warn("Recognition error: ", e.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (e.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognizing();
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard: " + transcript);
      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        console.log(data);
        // speak(data.response);
        handleCommand(data);
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognizing();
      }
    }, [10000]);
    return () => {
      safeRecognizing();
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
  }, []);

  return (
    <div className="w-full min-h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] relative">
      <button
        className="min-w-[120px] h-[60px] font-semibold absolute top-[20px] right-[20px] bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer "
        onClick={handleLogOut}
      >
        Log out
      </button>
      <button
        className="min-w-[150px] h-[60px] font-semibold absolute top-[100px] right-[20px] bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer px-[20px] py-[10px] "
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img src={userData?.assistantImage} alt="" className="h-full" />
      </div>
      <h1 className="text-white text-[18px] font-semibold">
        I'm <span className="text-blue-400">{userData?.assistantName}</span>
      </h1>
    </div>
  );
};

export default Home;
// 05-09-25