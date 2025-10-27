import React, { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Loader from "./components/Loader"; // 👈 add this line
import { userDataContext } from "./context/UserContext";

const App = () => {
  const { userData } = useContext(userDataContext);
  const [isBackendReady, setIsBackendReady] = useState(false);

  // useEffect(() => {
  //   const checkBackend = async () => {
  //     try {
  //       const res = await axios.get(
  //         "https://myaiassistantbackend.onrender.com/health"
  //       );
  //       if (res.status === 200) {
  //         setIsBackendReady(true);
  //       }
  //     } catch (err) {
  //       console.log("Backend cold start... retrying in 2s");
  //       setTimeout(checkBackend, 2000);
  //     }
  //   };
  //   checkBackend();
  // }, []);

  // if (!isBackendReady) {
  //   return <Loader />;
  // }

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData?.assistantImage && userData?.assistantName ? (
            <Home />
          ) : (
            <Navigate to={"/customize"} />
          )
        }
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/"} />}
      />
      <Route
        path="/customize"
        element={userData ? <Customize /> : <Navigate to={"/signup"} />}
      />
      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to={"/signup"} />}
      />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
