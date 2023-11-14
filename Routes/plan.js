import express from 'express';
import { Plan } from '../models/plan.js';
import { Foods } from '../models/foods.js';

const router =express.Router();

router.post('/plan-add',async(req,res)=>{
    try {
        const {foodId,quantity}=req.body;
        const foods = await Foods.findById(foodId);
        if(!foods){
            return res.status(404).json({message: "foods not found"});
        }

        const plan=await Plan.findOne({user:req.user._id});

        if(!plan){
            const newPlan = new Plan({
                user: req.user._id,
                foodsplan:[{foods:foodId,quantity}]
            })
            await newPlan.save();
            return res.status(201).json(newPlan)
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})



router.get("/plan-view",async (req,res)=>{
    try {
        const plan =await Plan.findOne({user:req.user._id}).populate("foodsplan.foodplan")
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message:"internal server error"})
    }
})

export const planRouter =router