import User from "../models/user.schema.js";
import Post from "../models/post.schema.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto from "crypto";

export const registerUser = async (req,res,next) => {
    try {
  
      const { name, email, password } = req.body;
  
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }
     
     user = await User.create({
        name,
        email,
        password,
        avatar: { public_id: "sample_id", url: "sample_url" },
    })
  
     res.status(200).json({
        sucess: true,
        // message: "User created successfully",
        user,
     });
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }
  
  export const login = async (req,res,next) => {
    try {
  
      const { email, password } = req.body;
  
      let user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User does not exist",
        });
      }
  
      const isMatch = await user.matchPassword(password);
  
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password",
        });
      }

      const token = await user.generateToken();

      const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

     res.status(200).cookie("token", token, options).json({
        sucess: true,
        // message: "User created successfully",
        user,
        token,
     });
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }

  export const logout = async (req,res,next) => {
    try {
  
      res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
        sucess: true,
        message: "Logged out",
       
     });
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }
  
  
  export const followUser = async (req,res,next) => {
    try {
  
      const userToFollow = await User.findById(req.params.id);
      const loggedInUser = await User.findById(req.user._id);
  
      if (!userToFollow) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }

      if (loggedInUser.following.includes(userToFollow._id)) {
        
        const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
        const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);


        loggedInUser.following.splice(indexfollowing, 1);
        userToFollow.followers.splice(indexfollowers, 1);

        await loggedInUser.save();
        await userToFollow.save();
        
        res.status(200).json({
          success: true,
          message: "User Unfollowed",
        });
      }
        else {
          loggedInUser.following.push(userToFollow._id);
          userToFollow.followers.push(loggedInUser._id);
    
          await loggedInUser.save();
          await userToFollow.save();
    
          res.status(200).json({
            success: true,
            message: "User followed",
          });
        }
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }
  

  export const updatePassword = async (req,res,next) => {
    try {
  
      const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated",
    });
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }

  export const updateProfile = async (req,res,next) => {
    try {
      const user = await User.findById(req.user._id);

      const { name, email } = req.body;
  
      if (name) {
        user.name = name;
      }
      if (email) {
        user.email = email;
      }
  
      // if (avatar) {
      //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
      //   const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      //     folder: "avatars",
      //   });
      //   user.avatar.public_id = myCloud.public_id;
      //   user.avatar.url = myCloud.secure_url;
      // }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Profile Updated",
      });
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }

  export const deleteMyProfile = async (req,res,next) => {
    try {
      const user = await User.findById(req.user._id);
      
      const posts = user.posts;
  
      const followers = user.followers;
      const following = user.following;
      const userId = user._id;
      
      await User.deleteOne({ _id: req.user._id });

       // Logout user after deleting profile

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

       // Delete all posts of the user 
       for (let i = 0; i < posts.length; i++) {
        // Use deleteOne instead of remove
        await Post.deleteOne({ _id: posts[i] });
      }

        // Removing User from Followers Following
    for (let i = 0; i < followers.length; i++) {
      const follower = await User.findById(followers[i]);

      const index = follower.following.indexOf(userId);
      follower.following.splice(index, 1);
      await follower.save();
    }

    // Removing User from Following's Followers
    for (let i = 0; i < following.length; i++) {
      const follows = await User.findById(following[i]);

      const index = follows.followers.indexOf(userId);
      follows.followers.splice(index, 1);
      await follows.save();
    }

    // removing all comments of the user from all posts
    const allPosts = await Post.find();

    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.comments.length; j++) {
        if (post.comments[j].user === userId) {
          post.comments.splice(j, 1);
        }
      }
      await post.save();
    }
    // removing all likes of the user from all posts

    for (let i = 0; i < allPosts.length; i++) {
      const post = await Post.findById(allPosts[i]._id);

      for (let j = 0; j < post.likes.length; j++) {
        if (post.likes[j] === userId) {
          post.likes.splice(j, 1);
        }
      }
      await post.save();
    }
    
  
      res.status(200).json({
        success: true,
        message: "Profile Deleted",
      });
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }

  export const myProfile  = async (req,res,next) => {
    try {
      const user = await User.findById(req.user._id).populate(
        "posts"
      );
  
      
        res.status(200).json({
        success: true,
        user,
      });
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }

  export const getUserProfile = async (req,res,next) => {
    try {
      const user = await User.findById(req.params.id).populate(
        "posts"
      );
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      res.status(200).json({
        success: true,
        user,
      });
} catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  }


  export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
  
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({email:req.body.email});
  
       if(!user){
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
       }

        const resetPasswordToken = user.getResetPasswordToken();
      
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`

        const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`
    
         try {
             await sendEmail({email:user.email, subject: "Reset Password", message})
         
             res.status(200).json({
              success: true,
              message: `Email sent to ${user.email}`,
            });
         
            } catch (error) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpire = undefined;
              await user.save();
        
              res.status(500).json({
                success: false,
                message: error.message,
              });
            }
           
        } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const resetPassword = async (req, res) => {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid or has expired",
        });
      }
  
      user.password = req.body.password;
  
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  