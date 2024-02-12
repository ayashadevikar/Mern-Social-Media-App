import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection = async () => {
    mongoose
    .connect(process.env.MONGO_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((conn)=>{
        console.log(`DB is connected to ${conn.connection.host}`)
    })
    .catch((error)=>{
        console.log(error);
        process.exit(1);
    })
}

export default dbConnection;