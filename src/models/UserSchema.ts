import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// userSchema.methods.generateAuthToken = () => {
//     // @ts-ignore
//     const token = jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
// };

export default mongoose.model("User", userSchema);
