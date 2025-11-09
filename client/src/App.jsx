import React, { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader";
import { userDataContext } from "./context/UserContext";

// ✅ Protected Route wrapper
const ProtectedRoute = ({ userData, children }) => {
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const App = () => {
  const { userData } = useContext(userDataContext);
  const [isBackendReady, setIsBackendReady] = useState(false);

  // --- Check if backend (Render) is ready
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" replace />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute userData={userData}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customize"
        element={
          <ProtectedRoute userData={userData}>
            <Customize />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customize2"
        element={
          <ProtectedRoute userData={userData}>
            <Customize2 />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
