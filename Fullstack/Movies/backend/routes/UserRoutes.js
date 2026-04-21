import express from "express";
import { CreateUser , Login , Logout} from "../controllers/UserController.js";
import { authenticateUser , authorizeAdmin , getAllUsers , updCurrentUser , addReview , updateReview , deleteReview , getAllReviews , getUserById , addMovieToList , removeMovieFromList} from "../middlewares/authMiddleware.js";
import { uploadSingleImage , preventDuplicateUpload } from "./uploadRoutes.js";
import { get } from "http";

const router = express.Router();
router.route("/").post(CreateUser).get(authenticateUser, authorizeAdmin, getAllUsers);
router.post('/login', Login);
router.post('/logout', Logout);
router.route('/profile').get(authenticateUser , getUserById).put(authenticateUser , uploadSingleImage , preventDuplicateUpload , updCurrentUser);

router.post("/review", authenticateUser, addReview);
router.put("/review/:reviewId", authenticateUser, updateReview);
router.delete("/review/:reviewId", authenticateUser, deleteReview);

router.get("/reviews/:movieId", getAllReviews);

router.post("/movielist", authenticateUser, addMovieToList);
router.delete("/movielist/:movieId/:listType/:mediaType", authenticateUser, removeMovieFromList);

router.route('/users').get(authenticateUser , getAllUsers);
// router.get('/users/reviews', getAllReviews);

export default router;