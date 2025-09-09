import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaHeart,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="w-full bg-[#0a0a1a] text-gray-300 border-t border-gray-700 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-white">Virtual Assistant</h2>
          <p className="text-gray-400 text-sm">
            Your AI-powered personal helper 🚀
          </p>
        </div>
        {/* Socials */}
        <div className="flex gap-4 text-xl">
          <a
            href="https://github.com/suyashtripathi3"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/suyashtripathi3/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.instagram.com/yashtiwari._.13?igsh=YnFqZ3p4OTVtOHQ="
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition"
          >
            <FaInstagram />
          </a>
          <a
            href="https://wa.me/918054696765" // 👈
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition"
          >
            <FaWhatsapp />
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="text-center text-gray-500 text-xs mt-4 pt-3 border-t border-gray-700">
        &copy; {new Date().getFullYear()} Virtual Assistant. All rights
        reserved.
        <p>
          Developed by Suyash Tripathi{" "}
          <FaHeart className="inline text-red-800" />
        </p>
      </div>
    </footer>
  );
}

export default Footer;
