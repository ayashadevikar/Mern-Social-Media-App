import express from 'express';
const router = express.Router();
import {
  
    createPost,
    deletePost,
    likeAndUnlikePost,
    getPostOfFollowing,
    updateCaption,
    commentOnPost,
    deleteComment
 
     
 
} from "../controller/post.controller.js";

import { isAuthenticated } from "../middlewares/auth.js";


router.post("/createPost", isAuthenticated, createPost);


router.delete("/deletePost/:id", isAuthenticated, deletePost);

router.get("/likeAndUnlikePost/:id", isAuthenticated, likeAndUnlikePost);

router.get("/getPostOfFollowing", isAuthenticated, getPostOfFollowing);

router.put("/updateCaption/:id", isAuthenticated, updateCaption);

router.put("/commentOnPost/:id", isAuthenticated, commentOnPost);

router.delete("/deleteComment/:id", isAuthenticated,  deleteComment);


export default router;