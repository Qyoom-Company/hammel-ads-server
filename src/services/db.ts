import mongoose from "mongoose";

const connection = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    try {
        mongoose.set("strictQuery", false);
        mongoose.connect(process.env.URI_STRING || "");
        console.log("connected");
    } catch (err) {
        console.error(err);
    }
};

export default connection;
