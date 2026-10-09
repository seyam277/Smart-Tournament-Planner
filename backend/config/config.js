import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Oracle Database
  ORACLE: {
    user: process.env.ORACLE_USER || 'your_username',
    password: process.env.ORACLE_PASSWORD || 'your_password',
    connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/xe'
  },
  
  // JWT
  JWT_SECRET: 'tournament_hobe_secure_secret_key_2026',
  JWT_EXPIRY: '7d',
  
  // Email
  EMAIL: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'your_app_password'
  },
  
  // File Storage
  FILE_STORAGE_PATH: path.join(__dirname, '../data'),
  
  // Frontend URL for password reset link
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
}

export default config
