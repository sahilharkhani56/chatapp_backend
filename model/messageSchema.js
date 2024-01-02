import mongoose from "mongoose";
export const MessageSchema = new mongoose.Schema(
  {
    message: {
      text: {
        type: String,
        required: true,
      },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestemps: true,
  }
);
export default mongoose.model("MessageSchema", MessageSchema);
