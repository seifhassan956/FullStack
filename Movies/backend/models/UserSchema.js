import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    MovieID: { type: Number, required: true },
}, { timestamps: true });

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    MovieID: { type: Number, required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    genre: { type: String, required: true },

    ListType: {
        type: String,
        enum: ["watchLater", "favourite", "watched"],
        required: true,
    },

    mediaType: {
        type: String,
        enum: ["movie", "series"],
        required: true,
    },

}, { timestamps: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,    
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    image: { type: String , default: '' },
    reviews: [reviewSchema],
    movies: [MovieSchema],
}, { timestamps: true });


export default mongoose.model("User", userSchema);