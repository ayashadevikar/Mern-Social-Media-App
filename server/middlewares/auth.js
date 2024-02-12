import User from "../models/user.schema.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req,res,next) => {
    try {
  
       const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
  
   
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }