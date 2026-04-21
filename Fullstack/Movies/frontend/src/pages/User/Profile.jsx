import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useUpdateProfileMutation } from "../../redux/api/users";
import { BASE_URL } from "../../redux/constants";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(""); 
  const [imageFile, setImageFile] = useState(null); 

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username);
      setEmail(userInfo.email);

      if (userInfo.image) {
        const isFullUrl = userInfo.image.startsWith("http") || userInfo.image.startsWith("data:");
        setImage(isFullUrl ? userInfo.image : `${BASE_URL}${userInfo.image}`);
      }
    }
  }, [userInfo]);

  const isEmailChanged = email !== userInfo?.email;
  const isPasswordChanged = password.length > 0;
  const requiresAuth = isEmailChanged || isPasswordChanged;

  // ✅ Local Image Preview Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image must be less than 2MB");
      }

      setImageFile(file);

      // Create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (requiresAuth && !currentPassword) {
      return toast.error("Current password is required to change email or password");
    }

    if (password !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      const formData = new FormData();
      if (username !== userInfo.username) formData.append("username", username);
      if (email !== userInfo.email) formData.append("email", email);
      if (password) formData.append("password", password);
      if (currentPassword) formData.append("currentPassword", currentPassword);
      if (imageFile) formData.append("image", imageFile);

      // Use .unwrap() to catch the error in the 'catch' block
      const res = await updateProfile(formData).unwrap();

      dispatch(setCredentials(res));

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setImageFile(null);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-black/70 p-10 rounded-md border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Edit Profile</h2>

        {isLoading && <Loader />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center space-y-2">
            <div 
              className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800 hover:border-red-600 transition-all"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-bold text-center">
                Click to change avatar
            </p>
          </div>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded px-4 py-3 outline-none focus:border-red-600"
          />

          <div className="space-y-4 bg-red-600/5 p-4 rounded-lg">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded px-4 py-3 outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded px-4 py-3 outline-none"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white rounded px-4 py-3 outline-none"
            />
          </div>

          <input
            type="password"
            placeholder="Current Password (required for sensitive changes)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#333] border border-gray-700 text-white rounded px-4 py-3 outline-none focus:border-red-600"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 disabled:bg-gray-600 transition-colors"
          >
            {isLoading ? "Saving..." : "UPDATE PROFILE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;