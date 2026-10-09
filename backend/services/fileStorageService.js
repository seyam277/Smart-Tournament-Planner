import fs from 'fs'
import path from 'path'
import config from '../config/config.js'

// Ensure data directory exists
const ensureDataDirectory = () => {
  if (!fs.existsSync(config.FILE_STORAGE_PATH)) {
    fs.mkdirSync(config.FILE_STORAGE_PATH, { recursive: true })
  }
}

// Tournament data file
const getTournamentFilePath = () => {
  ensureDataDirectory()
  return path.join(config.FILE_STORAGE_PATH, 'tournaments.json')
}

// User data file
const getUserFilePath = () => {
  ensureDataDirectory()
  return path.join(config.FILE_STORAGE_PATH, 'users.json')
}

// Read tournaments from file
export const readTournaments = () => {
  const filePath = getTournamentFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading tournaments file:', err)
  }
  return []
}

// Write tournaments to file
export const writeTournaments = (tournaments) => {
  const filePath = getTournamentFilePath()
  try {
    fs.writeFileSync(filePath, JSON.stringify(tournaments, null, 2))
    return true
  } catch (err) {
    console.error('Error writing tournaments file:', err)
    return false
  }
}

// Read users from file
export const readUsers = () => {
  const filePath = getUserFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      console.log(`[Storage] Read users from ${filePath}`)
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading users file:', err)
  }
  return []
}

// Write users to file
export const writeUsers = (users) => {
  const filePath = getUserFilePath()
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2))
    console.log(`[Storage] Wrote ${users.length} users to ${filePath}`)
    return true
  } catch (err) {
    console.error('Error writing users file:', err)
    return false
  }
}

export default {
  readTournaments,
  writeTournaments,
  readUsers,
  writeUsers
}
