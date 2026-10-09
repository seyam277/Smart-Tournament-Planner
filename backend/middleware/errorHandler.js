export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message })
  }
  
  res.status(500).json({ error: 'Internal server error' })
}

export default errorHandler
