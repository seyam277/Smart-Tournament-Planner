import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tournament_hobe')
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    console.warn('Backend will continue running, but database features will fail until MongoDB is connected.')
    // process.exit(1) // Don't exit, let it run so other features (like health check) might work
  }
}

export default connectDB
