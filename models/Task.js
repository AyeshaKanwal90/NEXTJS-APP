import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
