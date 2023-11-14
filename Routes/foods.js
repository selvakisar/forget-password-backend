import express from "express";
import { Foods } from "../models/foods.js";

const router = express.Router();

// all foods
router.get("/all", async (req, res) => {
  try {
    const food = await Foods.find();
    if (!food) {
      return res.status(400).send({ error: "foods not found" });
    }
    return res.status(200).json(food);
  } catch (error) {
    // error handle
    console.log(error);
    res.status(500).send({ error: "error creating on server" });
  }
});

// specific food
router.get("/item", async (req, res) => {});

//  add new food

router.post("/add", async (req, res) => {
  try {
    const food = await new Foods({ ...req.body }).save();

    if (!food) {
      return res.status(400).json({ message: "Error in adding food" });
    }
    res.status(200).send({ message: "food Added successfully", data: food });
  } catch (error) {
    // error handle
    console.log(error);
    res.status(500).send({ error: "error on  server" });
  }
});



router.post("/addmany", async (req, res) => {
  try {
    const food = await new Foods.insertMany({ ...req.body }).save();

    if (!food) {
      return res.status(400).json({ message: "Error in adding food" });
    }
    res.status(200).send({ message: "food Added successfully", data: food });
  } catch (error) {
    // error handle
    console.log(error);
    res.status(500).send({ error: "error on  server" });
  }
});


// edit food

router.put("/edit/:id", async (req, res) => {});
// delete food
router.delete("/del/:id", async (req, res) => {
  try {
    const deleteFood= await Foods.findByIdAndDelete({_id:req.params.id})
    if(!deleteFood){
      return res.status(400).json({ message: "food not found"})
    }
    res.status(200).send({ message: "food deleted successfully"})
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error on  server" });
  }
});
export const foodRouter = router;

// .send({message:"foods data successfully found"})
