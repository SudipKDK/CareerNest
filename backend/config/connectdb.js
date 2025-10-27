import mongoose from "mongoose";

const connectdb = async()=>{
    await mongoose.connect(process.env.Mongo_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
    })
}
export default connectdb;