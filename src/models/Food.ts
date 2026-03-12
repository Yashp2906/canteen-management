import mongoose from "mongoose"

const FoodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  status: String,
  image_url: String,
  image_public_id: String,
  category_id: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
},
  created_at: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Food || mongoose.model("Food", FoodSchema)