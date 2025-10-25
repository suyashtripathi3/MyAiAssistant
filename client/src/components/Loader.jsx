import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-bg from-gray-900 to-gray-800 text-white">
      <div className="relative flex justify-center items-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <span className="absolute text-lg font-semibold">AI</span>
      </div>
      <p className="mt-6 text-xl font-medium animate-pulse">Loading your AI Assistant...</p>
    </div>
  );
};

export default Loader;
