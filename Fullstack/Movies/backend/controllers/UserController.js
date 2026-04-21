import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import CreateToken from "../utils/CreateToken.js";

const CreateUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    const user = await UserSchema.findOne({ email });
    if (user) {
        res.status(400).json({ message: "User already exists" });
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserSchema.create({ username, email, password: hashedPassword });
        CreateToken(res, newUser._id);
        res.status(201).json(
            {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin
            }
        );
    }
});

const Login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserSchema.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
    }

    const token = CreateToken(res, user._id); 

    res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        // token, 
    });
});

const Logout = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
});

export { CreateUser , Login , Logout};