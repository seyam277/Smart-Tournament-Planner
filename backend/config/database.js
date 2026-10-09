import oracledb from 'oracledb'
import config from './config.js'

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

let connection = null

export const initializeDatabase = async () => {
  try {
    connection = await oracledb.getConnection({
      user: config.ORACLE.user,
      password: config.ORACLE.password,
      connectString: config.ORACLE.connectString
    })
    console.log('Oracle Database connected successfully')
    return connection
  } catch (err) {
    console.error('Oracle Database connection failed:', err)
    throw err
  }
}

export const getConnection = () => {
  if (!connection) {
    throw new Error('Database connection not initialized')
  }
  return connection
}

export const closeDatabase = async () => {
  if (connection) {
    await connection.close()
    console.log('Oracle Database connection closed')
  }
}

export default {
  initializeDatabase,
  getConnection,
  closeDatabase
}
