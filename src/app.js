import express, { urlencoded } from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))


//means hum json data accept krenge
app.use(express.json({limit : "16kb"}));
//url ke data ko sahi se covert krne ke liye && extended obj ke andar obj use krne ke liye
app.use(express.urlencoded({extended:true, limit : "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
import userRouter from "./routes/user.routes.js"


//routes declaration
app.use('/api/v1/users',userRouter)
//http://localhost:8000/api/v1/users/register
export {app}