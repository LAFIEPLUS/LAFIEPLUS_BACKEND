import mongoose from "mongoose";

// Cache connection across serverless function invocations
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing MongoDB connection");
        return;
    }


try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false, // Disable buffering for serverless
    });

    isConnected = true;
    console.log("MongoDB connected:", conn.connection.host);

} catch (error) {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    throw error; // Let the caller handle
}
};

export default connectDB;