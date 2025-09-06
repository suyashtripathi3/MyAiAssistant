import React, { useContext, useState } from "react";
import { userDataContext } from "../context/userContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { Navigate, useNavigate } from "react-router-dom";

function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setLoading(false);
      console.log(result.data);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full min-h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative">
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/customize")}
      />

      <h1 className="text-white text-[30px] text-center mb-[20px] ">
        Enter your <span className="text-blue-200">Assistand Name</span>
      </h1>
      <input
        type="name"
        placeholder="eg: jarvis"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
        required
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
      />
      {assistantName && (
        <button
          className="min-w-[300px] h-[60px] font-semibold bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer"
          disabled={loading}
          onClick={() => handleUpdateAssistant()}
        >
          {!loading ? "Finally create your Assistant" : "Loading..."}
        </button>
      )}
    </div>
  );
}

export default Customize2;
