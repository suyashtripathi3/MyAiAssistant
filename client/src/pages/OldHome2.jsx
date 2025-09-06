import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import axios from "axios";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);

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
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        isRecognizingRef.current = true;
        setListening(true);
        console.log("Recognition started");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Recognition error: ", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";

    // Hindi voice select
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // bolte waqt recognition band
      }
    };

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition(); // bolne ke turant baad recognition wapas start
      }, 500);
    };
    synth.cancel();

    synth.speak(utterance);
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

    if (type === "youtube_search" || type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
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
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true; //flag to avoid seState on unmountes component
    // Start recognition after 1 sec delay only if component still mounted
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition request to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      setListening(false);
      if (!isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (error) {
            if (e.name !== "InvalidStateError") console.log(error);
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (error) {
              if (e.name !== "InvalidStateError") console.log(error);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (e) => {
      console.warn("Recognition error: ", e.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (e.error !== "aborted" && isMounted && !isRecognizingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition stated after error");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.log(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("Heard: " + transcript);

      setAiText("");
      setUserText(transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        console.log("Gemini response:", data);

        if (data && data.response) {
          handleCommand(data);
          setAiText(data.response);
          setUserText("");
        }
      }
    };

    // fallback auto-restart
    // const fallback = setInterval(() => {
    //   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    //     startRecognition();
    //   }
    // }, 1000);

    // // initial start
    // setTimeout(() => {
    //   startRecognition();
    // }, 1000);

    // window.SpeechSynthesis = () => {
    const greeting = new SpeechSynthesisUtterance(
      `Hello ${userData.name}, what can i help you with?`
    );
    greeting.lang = "hi-IN";
    // greeting.onend = () => {
    //   startTimeout();
    // };
    window.SpeechSynthesis.speak(greeting);
    // };

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      // clearInterval(fallback);
    };
  }, []);

  return (
    <div className="w-full min-h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] relative">
      <CgMenuRight
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute top-0 w-full h-full lg:hidden bg-[#00000053] backdrop:blur-lg p-[20px] flex flex-col gap-[20px] items-start ${
          ham ? "translate-x-0" : "translate-x-full"
        } transition-transform`}
      >
        <RxCross1
          className=" text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />
        <button
          className="min-w-[120px] h-[60px] font-semibold  bg-white rounded-full text-black text-[19px]  cursor-pointer "
          onClick={handleLogOut}
        >
          Log out
        </button>
        <button
          className="min-w-[150px] h-[60px] font-semibold  bg-white rounded-full text-black text-[19px]  cursor-pointer px-[20px] py-[10px] "
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px]">History</h1>
        <div className="w-full h-[400px] overflow-auto flex flex-col gap-[20px] text-gray-200">
          {userData?.history?.map((his, i) => {
            return <span key={i}>{his}</span>;
          })}
        </div>
      </div>

      <button
        className="min-w-[120px] h-[60px] font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer "
        onClick={handleLogOut}
      >
        Log out
      </button>
      <button
        className="min-w-[150px] h-[60px] font-semibold absolute hidden lg:block top-[100px] right-[20px] bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer px-[20px] py-[10px] "
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
      {!aiText && <img src={userImg} alt="" className="w-[150px]" />}
      {aiText && <img src={aiImg} alt="" className="w-[150px]" />}
      <h1 className="text-white text-[18px] font-semibold">
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
};

export default Home;

// 06-09-25