import React, { useEffect } from "react";

const AICursor = () => {
  useEffect(() => {
    const cursor = document.querySelector(".ai-cursor");
    const ring = document.querySelector(".ai-cursor-ring");

    const moveCursor = (e) => {
      const { clientX: x, clientY: y } = e;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${x}px, ${y}px)`;
    };

    const clickEffect = () => {
      ring.style.width = "65px";
      ring.style.height = "65px";
      ring.style.border = "2px solid rgba(138, 43, 226, 0.9)";
      ring.style.boxShadow =
        "0 0 25px rgba(0,245,255,0.8), 0 0 45px rgba(138,43,226,0.9)";
      setTimeout(() => {
        ring.style.width = "45px";
        ring.style.height = "45px";
        ring.style.border = "2px solid rgba(0, 245, 255, 0.5)";
        ring.style.boxShadow = "none";
      }, 250);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("click", clickEffect);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("click", clickEffect);
    };
  }, []);

  return (
    <>
      <div className="ai-cursor"></div>
      <div className="ai-cursor-ring"></div>
    </>
  );
};

export default AICursor;
