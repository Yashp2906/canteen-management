import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  food_id: mongoose.Schema.Types.ObjectId,
  food_name: String,
  price: Number,
  quantity: Number,
  status: String,
  table_no: Number,
  user_name: String,
  user_phone: String,
  session_id: String,
  is_department_order: Boolean,
  department: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");
