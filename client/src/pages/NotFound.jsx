// pages/NotFound.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden relative font-sans">
      {/* Animated AI Grid Background */}
      <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 gap-1 opacity-10 pointer-events-none">
        {[...Array(400)].map((_, i) => (
          <motion.div
            key={i}
            className="w-full h-full bg-gradient-to-tr from-purple-500 to-blue-400 rounded-sm"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main 404 with Neon Glow */}
      <motion.h1
        className="text-[12rem] md:text-[15rem] font-extrabold text-white relative tracking-tight z-10 drop-shadow-[0_0_25px_rgba(128,0,255,0.7)]"
        initial={{ scale: 0.9, rotate: -3 }}
        animate={{ scale: [0.9, 1.05, 1], rotate: [-3, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        404
      </motion.h1>

      {/* Holographic Oops Message */}
      <motion.p
        className="text-xl md:text-3xl mt-6 text-center font-mono tracking-wide text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        Oops! Page Not Found — The AI Assistant couldn’t locate this page.
      </motion.p>

      {/* Futuristic Gradient Button */}
      <motion.div
        className="mt-10 z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <Link
          to="/"
          className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white font-semibold rounded-2xl shadow-[0_0_25px_rgba(128,0,255,0.7)] hover:scale-105 hover:shadow-[0_0_50px_rgba(128,0,255,1)] transition-all duration-300"
        >
          Return Home
        </Link>
      </motion.div>

      {/* Floating AI Neon Particles */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-50"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Holographic Floating AI Symbols */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white font-mono text-xl opacity-30"
          style={{
            left: Math.random() * window.innerWidth,
            top: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [0, 10, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          ⚡
        </motion.div>
      ))}

      {/* Optional Background Circuit Overlay */}
      <div className="absolute inset-0 bg-[url('https://i.imgur.com/1Q9Z1Zm.png')] bg-repeat opacity-5 mix-blend-overlay animate-pulse"></div>
    </div>
  );
}
