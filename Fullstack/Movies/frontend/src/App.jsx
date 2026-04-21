import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Navigation from "./pages/Auth/Navigation";
import { logout } from "./redux/features/auth/authSlice";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hideNav = location.pathname === "/";

  useEffect(() => {
    const checkAuth = () => {
      const expirationTime = localStorage.getItem("expirationTime");

      if (!expirationTime) return;

      const now = Date.now();

      if (now > Number(expirationTime)) {
        dispatch(logout());
        // navigate("/login");
        navigate("/");
      }
    };

    checkAuth();

  }, [dispatch, navigate]);

  return (
    <>
      <ToastContainer
        theme="dark"
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 99999 }}
      />

      {!hideNav && <Navigation />}

      <main
        className={`p-4 transition-all duration-300 bg-[#141414] min-h-screen text-white ${
          hideNav ? "" : "pt-20"
        }`}
      >
        <Outlet />
      </main>
    </>
  );
};

export default App;