import bcryptjs from 'bcryptjs'

const SALT_ROUNDS = 10

export const hashPassword = async (password) => {
  try {
    return await bcryptjs.hash(password, SALT_ROUNDS)
  } catch (err) {
    console.error('Error hashing password:', err)
    throw err
  }
}

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcryptjs.compare(password, hashedPassword)
  } catch (err) {
    console.error('Error comparing password:', err)
    throw err
  }
}

export default {
  hashPassword,
  comparePassword
}
