import React, { useContext, useState } from "react";
import backgroundImage from "../assets/authBg.png"; // Ensure you have an image in this path
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, userData, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      setLoading(false);
      navigate("/customize");
    } catch (error) {
      setUserData(null);
      setLoading(false);
      setError(error.response.data.message);
    }
  };
  return (
    <div
      className="w-full h-[100vh] bg-cover flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <form
        action=""
        className="w-[90%] h-[550px] max-w-[400px] bg-[#00000031] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
        onSubmit={handleSignup}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-blue-400">Vitual Asistant</span>
        </h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-full outline-none bg-transparent  rounded-full placeholder-gray-300   px-[20px] py-[10px]"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword && (
            <IoIosEye
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <IoIosEyeOff
              className="absolute top-[18px] right-[20px] text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>
        {error.length > 0 && (
          <p className="text-red-500 text-[17px]">*{error}</p>
        )}
        <button
          className="min-w-[150px] h-[60px] font-semibold bg-white rounded-full text-black text-[19px] mt-[30px] cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <p
          className="text-white text-[18px] cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account <span className="text-blue-400">Sign In</span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
