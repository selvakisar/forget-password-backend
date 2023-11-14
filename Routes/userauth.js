import  express  from "express";
import   bcrypt from "bcrypt"; 
import nodemailer from "nodemailer";
import {User,generateToken} from "../models/usersM.js"
import dotenv from "dotenv"
dotenv.config();
const router=express.Router();
import http from "http";

import { google } from "googleapis";
import { gmail } from "googleapis/build/src/apis/gmail/index.js";
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    "631662697401-e63rbh997maq5di47500rj4881u3qt9r.apps.googleusercontent.com",
    "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",
    "https://developers.google.com/oauthplayground" // Redirect URL
        // process.env.CLIENT_ID,
        // process.env.CLIENT_SECRET,
        // process.env.REFRESH_TOKEN,
    );
oauth2Client.setCredentials({
refresh_token: "1//0457nyUTF_M3bCgYIARAAGAQSNwF-L9IrDd1A9giWUwdeVaFnG0LLtx0dbJ6f9Zi7Z1uX19_afXGE5MOhztnjv2WD1XbBco2DPE8",
});
const accessToken = oauth2Client.getAccessToken()
dotenv.config()
// create user
router.post("/signup",async (req, res)=>{
   

    try {
         // find user of exsist
         let user = await User.findOne({email: req.body.email});
         if (user){
            return res.status(400).send({error:"email already exists"});
         }
        //  hash the password
        const salt =await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        // add the user to the database
        user = await new User({...req.body,password:hashedPassword}).save();
        // generate token and get response 
        const token = generateToken(user._id);
        res.status(201).send({message:"successfully created", token});
       
    } catch (error) {
        // error handle
        console.log(error);
        res.status(500).send({error:"error creatingon server"});
    }

})

// login user 
router.post("/login",async (req,res)=>{
try {
    // find the user
    const user= await User.findOne({email:req.body.email});

    if(!user){
        return res.status(404).send({error:"invalid email or password"});
    }


    // validate password

const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
    );
    if(!validatePassword){
        return res.status(404).send({error:"invalid email or password"});
    }

    // genrate token
const token = generateToken(user._id);

res.status(200).send({message:"sucessfully loged in",token})


} catch (error) {
    // error handle
        console.log(error);
        res.status(500).send({error:"error creatingon server"}); 
}
})





router.post("/forgetpass",async(req,res)=>{
    try {

        const {email}=req.body;

        const user = await User.findOne({email})
        if(!user){
            res.status(404).send({message:"User not found"})
        }

        const resetToken = Math.random().toString(36).substring(2,5);

        const resetLink =
        `https://forget-is-good.netlify.app/resetpass/?token=${resetToken}`;

        user.resetToken=resetToken;

        const updatepassword = await User.findByIdAndUpdate(user._id,user);
        if(updatepassword){
            res.status(201).send({message:"  To update password  link sent to your email",resetToken,resetLink})
        }

        const transporter = nodemailer.createTransport({
            service:"gmail",
           // use SSL
            auth:{
                type: "OAuth2",
                user:process.env.EMAIL_ID,
                pass:process.env.EMAIL_PASSWORD,
                clientId:
                 "631662697401-e63rbh997maq5di47500rj4881u3qt9r.apps.googleusercontent.com",
          clientSecret:
          "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",
          refreshToken:
          "1//0457nyUTF_M3bCgYIARAAGAQSNwF-L9IrDd1A9giWUwdeVaFnG0LLtx0dbJ6f9Zi7Z1uX19_afXGE5MOhztnjv2WD1XbBco2DPE8",
                accessToken: accessToken
        },
        tls: {
            rejectUnauthorized: false
          }
        })
       

        const mailOptions ={ 
            from:process.env.EMAIL_ID,
            to:user.email,
            subject:"reset password",
            text:resetLink
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log('email sent :'+info.response)
            }
        })
        
      
    } catch (error) {
        console.log(error);
        res.status(500).send({ error:"Internal Server Error"});
    }
})



//Route for reset password
router.post("/resetpass/:token",async(req,res)=>{
    try {
        const {token} = req.params;

        // find by token for user
        const user = await User.findOne({resetToken: token});
        if(!user){
            return res.status(404).send({error:"invalid token"})
        }
        if(token!==user.resetToken){
            return res.status(400).send({error:"cant find  token on server"})
        }

        // update password reset token

        const salt=await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        user.password = hashedPassword,
        await user.save();
        res.status(200).send({ message: 'Password updated successfully'});
    } catch (error) {
        
        //error handling
        console.log(error);
        res.status(500).send({ error:"Internal Server Error"});
    }

})
export const userRouter= router;






