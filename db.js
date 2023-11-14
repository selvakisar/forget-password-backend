import mongoose from 'mongoose';

const {URL,PORT}=process.env
export function dbConnect(){
 
  mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));
}