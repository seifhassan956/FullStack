import React, { useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth/authSlice";
import User from "../../components/User";

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);


  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();

      dispatch(logout());
      localStorage.clear();

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav
      style={{ zIndex: 9999 }}
      className="fixed top-0 left-0 w-full h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6 text-white"
    >
      {/* LEFT */}
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold tracking-tighter hover:text-gray-300">
          MOVIE<span className="text-red-500">APP</span>
        </Link>
      </div>

      {/* CENTER */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center hover:text-gray-400">
          <AiOutlineHome size={22} className="mr-1" />
          <span className="hidden sm:block text-sm font-medium">HOME</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex items-center">
        {userInfo ? (
          <User 
          dropdownOpen={dropdownOpen} 
          toggleDropdown={toggleDropdown} 
        />
        ) : (
          <div className="flex space-x-4">
            {location.pathname === "/login" ? (
              <Link to="/register">REGISTER</Link>
            ) : location.pathname === "/register" ? (
              <Link to="/login">LOGIN</Link>
            ) : (
              <>
                <Link to="/login">LOGIN</Link>
                <Link to="/register">REGISTER</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;