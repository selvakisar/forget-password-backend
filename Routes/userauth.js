import  express  from "express";
import   bcrypt from "bcrypt"; 
import nodemailer from "nodemailer";
import {User,generateToken} from "../models/usersM.js"
import dotenv from "dotenv"
dotenv.config();
const router=express.Router();
import http from "http";


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






