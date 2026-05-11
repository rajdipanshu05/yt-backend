import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        
        return {accessToken, refreshToken}
    } catch(err) {
        throw new ApiError(500, "Something went wrong while generating refresh and Access Token")
    }

}


const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user already exists : username, email
    //check for images,check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password an refresh token field from response
    //check for user creartion
    // return res
    const {fullName, username,email,password} = req.body
    console.log(fullName)


    if(
        [fullName, username,email,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400,"All Fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    console.log(req.files);
console.log(req.body);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) // yaha agar coverimage nhi hoga toh cloudinary "" string de deta hai

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring the User")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )


})

const loginUser = asyncHandler(async (req,res)=>{
    //req -body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie
    const {email,username,password} = req.body

    if(!(username || email)){
        throw new ApiError(400,"username or email is required");
    }
    
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    console.log(password);
    console.log(user.password);

    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,
                refreshToken
            },
            "User Logged In Successfully"
        )
    )
})
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true // return updated user
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User Logged Out SuccessFully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser
}