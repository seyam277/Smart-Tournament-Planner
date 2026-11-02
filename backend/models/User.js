import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['organizer', 'authority'], default: 'organizer' },
  authorityProfile: {
    businessName: { type: String, default: '' },
    businessContactNumber: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    preferredContact: { type: String, default: '' }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
export default User
