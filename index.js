const express = require('express')
const cors = require('cors')
const path = require('path')
const cron = require('node-cron')
require('dotenv').config()
const { connectDB } = require('./config/db')


// Import Routes
const userRoutes = require('./src/users/userRoute')
const miningRoutes = require('./src/mining/miningRoute')
const defaultMiningRoutes = require('./src/default-mining/defaultMiningRoutes')
const payoutRoutes = require('./src/payout/request/payoutRoutes')
const machineRoutes = require('./src/machine/machineRoute')
const settingsRoute = require('./src/settings/settingRoutes')
const notificationRoutes = require('./src/notifications/notificationRoutes')
const transactionsRoutes = require('./src/transactions/transactionsRoutes')
const forgotPasswordRoutes = require('./src/forgotPassword/forgotPasswordRoute')
const userPerformanceRoutes = require('./src/userPerformance/userPerformanceRoutes')
const MiningController = require('./src/mining/miningController')
const CalculationReportRoutes = require('./src/calculation-report/reportRoutes')
const invoicesRoutes = require('./src/invoices/invoicesRoutes')
const balanceRoutes = require("./src/balance/balanceRoute")

const app = express()

// Setup middleware and configurations
const setupMiddleware = () => {
    app.use(express.json())
    app.use(cors({
        origin: (origin, callback) => {
            callback(null, true); // Allow all origins
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }))
    app.use(express.static(path.join(__dirname, 'public')))
}

// Apply routes with common prefix
const setupRoutes = () => {
    app.use('/api', userRoutes)
    app.use('/api', userPerformanceRoutes)
    app.use('/api', forgotPasswordRoutes)
    app.use('/api', machineRoutes)
    app.use('/api', notificationRoutes)
    app.use('/api', miningRoutes)
    app.use('/api', defaultMiningRoutes)
    app.use('/api', payoutRoutes)
    app.use('/api', settingsRoute)
    app.use('/api', transactionsRoutes)
    app.use('/api', CalculationReportRoutes)
    app.use('/api', invoicesRoutes)
    app.use('/api', balanceRoutes)
}

// Start the server and connect to the database
const startServer = async () => {
    await connectDB()
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

// Set up cron job for scheduled tasks
const setupCronJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
            await MiningController.minePerMinuteController()
        } catch (error) {
        }
    })
    console.log('Cron job started')
}

// Initialize the server setup
const initializeServer = () => {
    setupMiddleware()
    setupRoutes()
    if (process.env.NODE_ENV === "PROD") {
        setupCronJob()
    }
    startServer()
}

initializeServer()
