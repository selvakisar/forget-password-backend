import express, { Router } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./Routes/userauth.js";
import { foodRouter } from "./Routes/foods.js";
import { isAuthenticated } from "./Authentication/auth.js";
import { planRouter } from "./Routes/plan.js";
dotenv.config();
const {URL,PORT}=process.env

// db 
 mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));



// initial server

const app=express();

// midware

app.use(cors());

app.use(express.json());

// router


app.use ("/api/user",userRouter);
app.use("/api/foods",isAuthenticated,foodRouter)
app.use("/api/plan",isAuthenticated,planRouter)
// listen

app.listen(PORT,()=>console.log(`server started on the${PORT}`));