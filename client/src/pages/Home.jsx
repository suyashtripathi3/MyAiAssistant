// Home.jsx
import React from "react";
import { useHomeLogic } from "../utils/HomeLogic.js";
import HomeUI from "./HomeUI.jsx";

const Home = () => {
  const logic = useHomeLogic();
  return <HomeUI {...logic} />;
};

export default Home;
