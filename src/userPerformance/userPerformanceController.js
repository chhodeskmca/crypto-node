const User = require('../users/userModel')
const UserPerformance = require('./userPerformanceModel')
const { sendEmailToAdmin } = require('../../utils/emailService')

// Function to save requested performance
exports.saveRequestedPerformance = async (req, res) => {
    try {
        const { userId, requestedPerformance } = req.body


        if (!requestedPerformance) {
            return res.status(400).json({ status: false, message: 'Requested performance cannot be empty' })
        }

        const existingRequest = await UserPerformance.findOne({ userId })

        if (existingRequest) {

            if (existingRequest.requestedPerformance === null) {
                existingRequest.requestedPerformance = requestedPerformance
                await existingRequest.save()


                const userInfo = await User.findById(userId)
                await sendEmailToAdmin({ performance: requestedPerformance, email: userInfo.email, name: userInfo.name })

                return res.status(200).json({
                    status: true,
                    message: 'We have successfully updated your request to buy more performance!'
                })
            }

            return res.status(200).json({
                status: false,
                message: 'You have already submitted a request for more performance.'
            })
        }

        // Create a new performance request if none exists
        const newUserPerformance = new UserPerformance({
            userId,
            requestedPerformance
        })

        await newUserPerformance.save()

        const userInfo = await User.findById(userId)
        await sendEmailToAdmin({ performance: requestedPerformance, email: userInfo.email, name: userInfo.name })

        return res.status(201).json({ status: true, message: 'We have successfully created your request to buy more performance!' })

    } catch (error) {
        console.error('Error saving requested performance:', error)
        return res.status(500).json({ status: false, message: 'Failed to submit requested performance due to an internal error.' })
    }
}