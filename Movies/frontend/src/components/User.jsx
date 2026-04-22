import React from "react";
import { AiOutlineLogin, AiOutlineUserAdd } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/users"; // Import your API logout
import { logout } from "../redux/features/auth/authSlice";
import { BASE_URL } from "../redux/constants";

const User = ({ dropdownOpen, toggleDropdown }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      navigate("/login");
    }
  };

  const getAvatarUrl = () => {
    if (!userInfo?.image) return defaultAvatar;
    if (userInfo.image.startsWith("http") || userInfo.image.startsWith("data:")) {
      return userInfo.image;
    }
    const imagePath = userInfo.image.startsWith("/") ? userInfo.image : `/${userInfo.image}`;
    return `${BASE_URL}${imagePath}`;
  };

  if (!userInfo) {
    return (
      <div className="flex items-center space-x-5">
        <Link to="/login" className="flex items-center hover:text-gray-400 transition-colors">
          <AiOutlineLogin size={20} className="mr-1" />
          <span className="text-xs font-bold uppercase">Login</span>
        </Link>
        {/* <Link to="/register" className="flex items-center bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-all">
          <AiOutlineUserAdd size={18} className="mr-1" />
          <span className="text-xs font-bold uppercase">Register</span>
        </Link> */}
      </div>
    );
  }

  return (
    <div className="flex items-center relative">
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center focus:outline-none transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-full border-2 border-gray-700 hover:border-red-500 overflow-hidden bg-gray-800 transition-all">
            <img
              src={getAvatarUrl()}
              alt="profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
          </div>
        </button>

        {dropdownOpen && (
          <ul className="absolute right-0 mt-3 w-48 bg-[#1a1a1a] border border-gray-800 rounded-md shadow-2xl py-2 z-50">
            <li className="px-4 py-2 border-b border-gray-800 mb-1">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-bold truncate">{userInfo.username}</p>
            </li>

            {userInfo.isAdmin && (
              <>
                <li className="px-4 py-1 text-[10px] font-bold text-red-500 uppercase tracking-widest">Admin</li>
                <li>
                  <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-800 text-white">Dashboard</Link>
                </li>
                <div className="border-t border-gray-800 my-1"></div>
              </>
            )}
            
            <li>
              <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-800 text-white">Profile Settings</Link>
            </li>
            <li>
              <button
                onClick={logoutHandler}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default User;