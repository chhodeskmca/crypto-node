const User = require('../users/userModel');
const UserPerformance = require('./userPerformanceModel');
const ApiResponseTrait = require('../../utils/apiResponse'); // Assume this is your response utility

// Function to save requested performance
exports.saveRequestedPerformance = async (req, res, emailService) => {
    try {
        const { userId, requestedPerformance } = req.body;

        // Validate required fields
        if (!requestedPerformance) {
            return res.status(400).json({ status: false, message: 'Requested performance cannot be empty' });
        }

        // Check if there's an existing performance request for the user
        const existingRequest = await UserPerformance.findOne({ userId });

        if (existingRequest) {
            // If the existing request has no performance value, update it
            if (existingRequest.requestedPerformance === null) {
                existingRequest.requestedPerformance = requestedPerformance;
                await existingRequest.save();

                // Optional: Send email notification to admin
                // const userInfo = await User.findById(userId);
                // await emailService.sendEmailToAdmin({ performance: requestedPerformance, email: userInfo.email, name: userInfo.name });

                return res.status(200).json({ status: true, message: 'We have successfully updated your request to buy more performance!' });
            }

            // If the request already has a performance value, return an error response
            return res.status(409).json({ status: false, message: 'You have already submitted a request for more performance.' });
        }

        // Create a new performance request if none exists
        const newUserPerformance = new UserPerformance({
            userId,
            requestedPerformance
        });

        await newUserPerformance.save();

        // Optional: Send email notification to admin
        // const userInfo = await User.findById(userId);
        // await emailService.sendEmailToAdmin({ performance: requestedPerformance, email: userInfo.email, name: userInfo.name });

        return res.status(201).json({ status: true, message: 'We have successfully created your request to buy more performance!' });

    } catch (error) {
        // Log the error and return a 500 Internal Server Error response
        console.error('Error saving requested performance:', error);
        return res.status(500).json({ status: false, message: 'Failed to submit requested performance due to an internal error.' });
    }
};