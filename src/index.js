// require('dotenv').config({path: './env'}); no problem here

import dotenv from "dotenv";
dotenv.config();

import connectDB from './db/index.js';
import { app } from "./app.js";

console.log("cloud name:", process.env.CLOUDINARY_CLOUD_NAME)
console.log("api key:", process.env.CLOUDINARY_API_KEY)
console.log("api secret:", process.env.CLOUDINARY_API_SECRET)

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is listening on port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB connection Failed !!" ,err);
})
























/*
import express from "express";
const app = express();
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}`/${DB_NAME})
        app.on("error",(error)=>{
            console.log("ERROR : ",error);
            throw error;
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port : ${process.env.PORT}`);
            
        })
    } catch(error){
        console.error("error",error);
        throw error
    }
})()
*/
