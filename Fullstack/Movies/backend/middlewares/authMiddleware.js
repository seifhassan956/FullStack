import jwt from "jsonwebtoken";
import UserSchema from "../models/UserSchema.js";
import asyncHandler from "./asyncHandler.js";
import bcrypt from 'bcryptjs';
import path from "path";     
import fs from "fs";    

const authenticateUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await UserSchema.findById(decoded.userId).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed", error: error.message });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
});

const authorizeAdmin = (req, res, next) => {
    if (req.user?.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized, admin only" });
    }
};

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await UserSchema.find();
    res.status(200).json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await UserSchema.findById(req.user._id);

    if (user) {
        res.status(200).json({
            // _id: user._id,
            username: user.username,
            // email: user.email,
            isAdmin: user.isAdmin,
            image: user.image,
            reviews: user.reviews,
            movies: user.movies,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

const updCurrentUser = asyncHandler(async (req, res) => {
  const user = await UserSchema.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { username, email, password, currentPassword } = req.body;

  const isEmailChanged = email && email !== user.email;
  const isPasswordChanged = password && password.length > 0;
  const isSensitiveUpdate = isEmailChanged || isPasswordChanged;

  if (isSensitiveUpdate) {
    if (!currentPassword) {
      res.status(400);
      throw new Error("Current password is required to change email or password");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid current password");
    }
  }

  if (username) {
    user.username = username;
  }

  if (isEmailChanged) {
    user.email = email;
  }

  if (isPasswordChanged) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  if (req.file) {
    if (user.image && user.image.startsWith("/uploads/")) {
      const oldPath = path.join("uploads", path.basename(user.image));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.image = req.file.savedPath;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    image: updatedUser.image,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { comment, MovieID } = req.body;
  const user = await UserSchema.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const review = {
    user: req.user._id,
    comment,
    MovieID: Number(MovieID),
  };

  user.reviews.push(review);
  await user.save();

  res.status(201).json({ message: "Review added successfully", reviews: user.reviews });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { reviewId } = req.params; 

  const user = await UserSchema.findById(req.user._id);

  if (!user) {
      res.status(404);
      throw new Error("User not found");
  }

  const review = user.reviews.id(reviewId);

  if (!review) {
      res.status(404);
      throw new Error("Comment not found");
  }

  review.comment = comment;
  await user.save();

  res.status(200).json({ message: "Comment updated", review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const user = await UserSchema.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.reviews = user.reviews.filter(
    (r) => r._id.toString() !== req.params.reviewId
  );

  await user.save();

  res.status(200).json({ message: "Review removed" });
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const users = await UserSchema.find({}, "username image reviews");

  const allReviews = users.reduce((acc, user) => {
    const enhancedReviews = user.reviews.map((rev) => ({
      ...rev.toObject(),
      user: {
        username: user.username,
        image: user.image,
        _id: user._id,
      },
    }));

    return [...acc, ...enhancedReviews];
  }, []);

  res.status(200).json(allReviews);
});

export const addMovieToList = asyncHandler(async (req, res) => {
  const { title, MovieID, genre, ListType, mediaType } = req.body;

  const validListTypes = ["watchLater", "favourite", "watched"];
  if (!validListTypes.includes(ListType)) {
    res.status(400);
    throw new Error("Invalid List Type");
  }

  const validMediaTypes = ["movie", "series"];
  if (!validMediaTypes.includes(mediaType)) {
    res.status(400);
    throw new Error("Invalid media type (must be movie or series)");
  }

  if (!title || !MovieID || !genre) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const user = await UserSchema.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const alreadyExists = user.movies.find(
    (m) =>
      m.MovieID === Number(MovieID) &&
      m.ListType === ListType &&
      m.mediaType === mediaType
  );

  if (alreadyExists) {
    res.status(400);
    throw new Error("Already exists in this list");
  }

  const newMovie = {
    title,
    MovieID: Number(MovieID), 
    genre,
    ListType,
    mediaType,
    user: user._id,
  };

  user.movies.push(newMovie);

  await user.save();

  res.status(201).json({
    message: "Added successfully",
    movies: user.movies,
  });
});

export const removeMovieFromList = asyncHandler(async (req, res) => {
  const { movieId, listType, mediaType } = req.params;
  
  const MovieID = Number(movieId);
  const ListType = listType;

  const validListTypes = ["watchLater", "favourite", "watched"];
  if (!validListTypes.includes(ListType)) {
    res.status(400);
    throw new Error("Invalid List Type");
  }

  const validMediaTypes = ["movie", "series"];
  if (!validMediaTypes.includes(mediaType)) {
    res.status(400);
    throw new Error("Invalid media type");
  }

  const user = await UserSchema.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const beforeCount = user.movies.length;

  user.movies = user.movies.filter(
    (m) =>
      !(
        m.MovieID === MovieID &&
        m.ListType === ListType &&
        m.mediaType === mediaType
      )
  );

  if (user.movies.length === beforeCount) {
    res.status(404);
    throw new Error("Movie not found in this list");
  }

  await user.save();

  res.status(200).json({
    message: "Removed successfully",
    movies: user.movies,
  });
});

export { authenticateUser, authorizeAdmin, getAllUsers , getUserById , updCurrentUser };