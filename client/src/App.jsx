import React, { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader";
import { userDataContext } from "./context/UserContext";

const App = () => {
  const { userData } = useContext(userDataContext);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await axios.get(
          "https://myaiassistantbackend.onrender.com/health"
        );
        if (res.status === 200) {
          setIsBackendReady(true);
        }
      } catch (err) {
        console.log("Backend cold start... retrying in 2s");
        setTimeout(checkBackend, 2000);
      }
    };
    checkBackend();
  }, []);

  if (!isBackendReady) {
    return <Loader />;
  }

  // ✅ Determine if user came from signup or signin
  const fromSignup = location.state?.fromSignup;

  return (
    <Routes>
      {/* Home Route */}
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />

      {/* Signup Route */}
      <Route
        path="/signup"
        element={
          !userData ? (
            <SignUp />
          ) : (
            <Navigate to="/customize" state={{ fromSignup: true }} />
          )
        }
      />

      {/* Signin Route */}
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />

      {/* Customize Route */}
      <Route
        path="/customize"
        element={
          userData ? (
            fromSignup ? (
              <Customize />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Navigate to="/signup" />
          )
        }
      />

      {/* Customize2 Route */}
      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to="/signup" />}
      />

      {/* Not Found */}
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
