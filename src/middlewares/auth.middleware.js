import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req,_,next)=>{ //res ka use nhi hai-> In production code
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401, "Unauthorized Access");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //access token generate krte time humne id bhi daala tha isiliye access kr skte hai id decoded
        // token se
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            //NEXT VIDEO : discuss about frontend
            throw new ApiError(401,"Invalid Access Token")
        }
        //ab iske aage ke har middleware aur controller ke pass req se user ka access hoga
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})