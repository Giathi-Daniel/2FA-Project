require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const { securityMiddleware } = require('./utils/security')
const authRoutes = require('./routes/authRoutes')

const app = express()

// Middleware
app.use(express.json())
app.use(securityMiddleware)

// databse connection
connectDB()

// Routes
app.use('/api/auth', authRoutes)

// eroor Handling
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ eror: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})