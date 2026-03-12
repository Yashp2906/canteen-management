import mongoose from "mongoose"

const SessionSchema = new mongoose.Schema({
  token: String,
  expires_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Session || mongoose.model("Session", SessionSchema)