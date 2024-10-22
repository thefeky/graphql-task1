import mongoose from "mongoose";

const todoSchema = mongoose.Schema({
  title: {
    type: String,
    minLength: 2,
    maxLength: 20,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["todo", "done", "inProgress"],
  },
  userId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
});

export const todoModel = mongoose.model("Todo", todoSchema);
