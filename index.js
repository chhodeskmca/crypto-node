const express = require('express')
const cors = require('cors')
const path = require('path')
const cron = require('node-cron')
require('dotenv').config()
const connectDB = require('./config/db')

// Import Routes
const userRoutes = require('./src/users/userRoute')
const miningRoutes = require('./src/mining/miningRoute')
const payoutRoutes = require('./src/payout/request/payoutRoutes')
const machineRoutes = require('./src/machine/machineRoute')
const settingsRoute = require('./src/settings/settingRoutes')
const notificationRoutes = require('./src/notifications/notificationRoutes')
const transactionsRoutes = require('./src/transactions/transactionsRoutes')
const forgotPasswordRoutes = require('./src/forgotPassword/forgotPasswordRoute')
const userPerformanceRoutes = require('./src/userPerformance/userPerformanceRoutes')
const MiningController = require('./src/mining/miningController')
const User = require('./src/users/userModel')
const Mining = require('./src/mining/miningModel')
const Balance = require('./src/balance/balanceModel')
const { AssignedMachine, Machine } = require('./src/machine/machineModel')
const PayoutRequest = require('./src/payout/request/payoutRequestModel')
const Transaction = require('./src/transactions/transactionsModel')


const app = express()

// Setup middleware and configurations
const setupMiddleware = () => {
    app.use(express.json())
    app.use(cors({
        origin: '*',
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
    app.use('/api', payoutRoutes)
    app.use('/api', settingsRoute)
    app.use('/api', transactionsRoutes)
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
            const response = await MiningController.getCurrentHashRateController()
            console.log('API response:', response)
        } catch (error) {
        }
    })
    console.log('Cron job started')
}



async function updateBalanceUserIds() {
    try {
        // Step 1: Retrieve all balance documents
        const minings = await Transaction.find().lean()


        // Step 2: Loop through each balance and update the userId with user._id
        for (const balance of minings) {
             // Step 2a: Find the corresponding user using balance.userId
            const user = await User.findOne({ id: balance.userId }); // Adjust query if needed based on your schema

            // Step 2b: If user is found, update balance.userId with user._id
            if (user) {
                await Transaction.updateOne(
                    { _id: balance._id }, // Match by balance's _id
                    { $set: { userId: user._id } } // Replace userId with user's _id
                );
                console.log(`Updated balance ${balance._id} userId to ${user._id}`)
            }
        }

        console.log('Balance userId update complete!');
    } catch (error) {
        console.error('Error updating balance userIds:', error.message)
    }
}

// // Call the function to perform the update
// updateBalanceUserIds()
// Initialize the server setup
const initializeServer = () => {
    setupMiddleware()
    setupRoutes()
    // setupCronJob()
    startServer()
}

initializeServer()