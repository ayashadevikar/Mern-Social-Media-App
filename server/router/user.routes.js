import express from 'express';
const router = express.Router();
import {
  
    registerUser,
    login,
    followUser,
    logout,
    updatePassword,
    updateProfile,
    deleteMyProfile,
    myProfile,
    getUserProfile,
    getAllUsers,
    forgotPassword 
 
} from "../controller/user.controller.js";

import { isAuthenticated } from "../middlewares/auth.js";

router.post("/registerUser", registerUser);

router.post("/login", login);

router.get("/followUser/:id", isAuthenticated, followUser);

router.get("/logout", isAuthenticated, logout);

router.put("/updatePassword", isAuthenticated, updatePassword);

router.put("/updateProfile", isAuthenticated, updateProfile);

router.delete("/deleteMyProfile/:id", isAuthenticated, deleteMyProfile);

router.delete("/myProfile", isAuthenticated, myProfile);

router.get("/getUserProfile", isAuthenticated, getUserProfile);

router.get("/getAllUsers", isAuthenticated, getAllUsers);

router.post("/forgotPassword ", isAuthenticated,  forgotPassword);

export default router;