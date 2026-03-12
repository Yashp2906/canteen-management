import mongoose from "mongoose"

const CategorySchema = new mongoose.Schema({
  name: String,
  created_at: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Category || mongoose.model("Category", CategorySchema)