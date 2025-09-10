import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContext from "./context/UserContext.jsx";
import AICursor from "./components/AICursor.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserContext>
      <AICursor />
      <App />
    </UserContext>
  </BrowserRouter>
);
