const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./userModel")
const Mining = require('../mining/miningModel')
const PayoutSetting = require('../payout/settings/payoutSettingModel')
const nodemailer = require('nodemailer')
const moment = require('moment')
const Balance = require("../balance/balanceModel")
const { successResponse } = require("../../utils/apiResponse")
const { default: mongoose } = require("mongoose")
const { customError } = require("../../utils/helper")
const AdminAuthentication = require("../authentication/adminAuthenticationModel")
const { mailSMTP, ROLE_TYPES } = require("../../config")
const { ObjectId } = mongoose.Types


// Service function for creating a user
exports.createUser = async (req, res) => {
    const { name, email, walletAddress, password, phoneNo = '', roleType, isAdmin, createdBy, origin, electricityExchange } = req.body

    // Check if email or wallet address is already in use
    const existingUserByEmail = await User.findOne({ email })
    if (existingUserByEmail)
        return res.status(400).json({ error: 'The email address is already in use!!' })

    const existingUserByWalletAddress = await User.findOne({ walletAddress })
    if (existingUserByWalletAddress && !isAdmin && roleType === ROLE_TYPES.USER)
        return res.status(400).json({ error: 'The wallet address is already in use!!' })


    // Get minimum payout settings
    const payoutSettings = await PayoutSetting.findOne()
    const minPayoutAmount = payoutSettings ? payoutSettings.minimumBalance : 0

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create and save user
    const user = new User({
        name,
        email,
        walletAddress,
        phoneNo,
        password: hashedPassword,
        minPayoutAmount,
        orderedHashrate: 0,
        electricitySpendings: 0,
        roleType,
        isAdmin,
        origin,
        createdBy,
        electricityExchange
    })
    await user.save()

    if (!isAdmin) {
        // Create mining record for the user
        const mining = new Mining({
            userId: user._id,
            hour: [],
            day: [],
            week: [],
            month: [],
        })
        await mining.save()

        // Create mining record for the user
        const balance = new Balance({
            userId: user._id,
            balance: 0,
            kaspa: 0,
            electricity: 0,
            payoutRequest: 0,
        })
        await balance.save()
    }

    return res.status(200).json({ message: `${isAdmin ? 'Admin' : 'User'} created successfully.`, status: true })
}

// Service function for logging in
exports.login = async (req, res) => {
    try {

        const { email, password, type } = req.body
        // Check if user exists
        const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } })
        if (!user) {
            throw customError({ code: 404, message: 'Email not found!' })
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw customError({ code: 404, message: 'Incorrect password!' })
        }


        // Check user type based on isAdmin flag and the request type
        if ((!user.isAdmin && type === 'admin') || (user.isAdmin && type === 'user')) {
            throw customError({ code: 404, message: 'Incorrect credentials' })
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        // Check admin authentication settings
        let adminAuthentication = await AdminAuthentication.findOne()
        const isAuthenticationOn = adminAuthentication ? adminAuthentication.authenticationEnabled : false

        if (isAuthenticationOn && type === 'admin') {
            if (!adminAuthentication) {
                adminAuthentication = new AdminAuthentication()
            }

            // Generate and save OTP
            const otp = Math.floor(100000 + Math.random() * 900000)
            adminAuthentication.otp = otp
            adminAuthentication.validDuration = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
            adminAuthentication.userInfo = JSON.stringify({ token, user, authentication: isAuthenticationOn })
            await adminAuthentication.save()

            // Send OTP email
            const mailOptions = {
                from: process.env.MAIL_FROM_ADDRESS,
                to: process.env.MAIL_ADMIN,
                subject: 'Admin Authentication OTP',
                text: `Your OTP is ${otp}`,
            }

            mailSMTP.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error)
                } else {
                    console.log("Email sent:", info.response)
                }
            })

            return {
                token, user, authentication: isAuthenticationOn,
                message: 'We have sent an OTP to your email. Please enter the 6 digit OTP to log in.',
            }
        }

        return {
            token, user, authentication: false,
            message: 'Login successfully!'
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}

// Service function for getting all users
exports.getAllUsers = async (req) => {
    const userId = req.userId

    const getRoleType = await User.findOne({ _id: new ObjectId(userId) })
    const roleType = getRoleType.roleType


    const matchConditions = {
        $and: [
            {
                $or: [
                    { isAdmin: false },
                    { isAdmin: "0" },
                    { isAdmin: { $exists: false } }
                ]
            },
            { roleType: ROLE_TYPES.USER }
        ]
    }


    if (roleType === ROLE_TYPES.ADMIN) {
        matchConditions.$and.push({ createdBy: new ObjectId(userId) })
    }

    const users = await User.aggregate([
        {
            $match: matchConditions
        },
        // {
        //     $lookup: {
        //         from: 'minings',
        //         localField: '_id',
        //         foreignField: 'userId',
        //         as: 'miningData',
        //     },
        // },
        {
            $project: {
                name: 1,
                email: 1,
                phoneNo: 1,
                walletAddress: 1,
                minPayoutAmount: 1,
                orderedHashrate: 1,
                electricitySpendings: 1,
                electricityExchange: 1,
                // miningData: 1,
                created_at: 1,
                createdAt: 1,
            },
        },
        {
            $sort: {
                'created_at': -1
            }
        }
    ])
    return successResponse(users, 'Users get successfully')
}

// Service function for getting all users
exports.fetchAdminUsersByParentId = async (req) => {
    const { id } = req.params

    const users = await User.aggregate([
        {
            $match: {
                isAdmin: true,
                roleType: ROLE_TYPES.ADMIN,
                createdBy: new ObjectId(id)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'createdBy',
                as: 'createdUsers'
            }
        },
        {
            $project: {
                createdUsersCount: { $size: "$createdUsers" },
                name: 1,
                email: 1,
                phoneNo: 1,
                walletAddress: 1,
                minPayoutAmount: 1,
                orderedHashrate: 1,
                electricitySpendings: 1,
                miningData: 1,
                created_at: 1,
                createdAt: 1,
                origin: 1,
                isAdmin: 1,
                roleType: 1
            },
        }
    ])
    return successResponse(users, 'Admin get successfully')
}


// Service function for getting user info
exports.getMinPayoutAmount = async (req, res) => {
    const { userId } = req.params
    const user = await User.findOne(new ObjectId(userId))

    if (!user) throw new Error('User not found')

    return res.status(200).json({ status: true, data: user.minPayoutAmount })
}
// Service function for getting user info
exports.getUserInfo = async (req, res) => {
    const { userId } = req.params
    const user = await User.aggregate([
        {
            $match: { _id: new ObjectId(userId) }
        },
        {
            $lookup: {
                from: "assignedmachines",
                localField: "_id",
                foreignField: "userId",
                as: "assigned_machines"
            }
        },
        {
            $lookup: {
                from: "machines",
                localField: "assigned_machines.machineId",
                foreignField: "_id",
                as: "machine_details"
            }
        },
        {
            $addFields: {
                assigned_machines: {
                    $map: {
                        input: "$assigned_machines",
                        as: "assigned_machine",
                        in: {
                            $mergeObjects: [
                                "$$assigned_machine",
                                {
                                    machine: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$machine_details",
                                                    as: "machine",
                                                    cond: { $eq: ["$$machine._id", "$$assigned_machine.machineId"] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $unset: "machine_details" // Remove the temporary machine details field
        },
        {
            $addFields: {
                assigned_machines: {
                    $ifNull: ["$assigned_machines", []] // Ensure assigned_machines is an empty array if it's null
                }
            }
        }
    ])

    if (!user.length) throw new Error('User not found')

    return res.status(200).json({ status: true, data: user[0] })
}

// Service function for updating a user
exports.updateUser = async (userData, userId) => {
    const { name, email, walletAddress, phoneNo, electricityExchange } = userData
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    user.name = name
    user.email = email
    user.walletAddress = walletAddress
    user.phoneNo = phoneNo
    user.electricityExchange = electricityExchange
    await user.save()

    return user
}

// Service function for updating password
exports.updatePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body

    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) throw new Error('Incorrect old password')

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return res.status(200).json({ message: 'Password updated successfully', status: true })
}

// Service function for deleting a user
exports.deleteUser = async (userId) => {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    await Promise.all([
        mongoose.model('Mining').deleteMany({ userId }),
        mongoose.model('Balance').deleteMany({ userId }),
        mongoose.model('PayoutRequest').deleteMany({ userId }),
        mongoose.model('Transaction').deleteMany({ userId }),
        mongoose.model('AssignedMachine').deleteMany({ userId }),
    ])

    await user.deleteOne()
    return true
}


exports.updateUserMinPayoutAmount = async (userId, minPayoutAmount) => {
    try {
        // Find the user by ID
        const user = await User.findById(userId)

        // If user is not found, return a 404 response
        if (!user) {
            return {
                statusCode: 404,
                data: { status: false, message: 'User not found' }
            }
        }

        // Update the minPayoutAmount field
        user.minPayoutAmount = minPayoutAmount
        await user.save()

        // Return a success response
        return {
            statusCode: 200,
            data: { status: true, message: 'Minimum payout amount updated successfully' }
        }
    } catch (error) {
        // Handle any errors that occur during the database operation
        return {
            statusCode: 500,
            data: { status: false, message: error.message }
        }
    }
}


exports.adminTwoFactorAuthentication = async (req, res) => {
    try {
        const { otp } = req.body



        if (!otp) {
            return res.status(422).json({ message: 'OTP is required', status: false })
        }

        // Find the OTP record in the database
        const adminAuthentication = await AdminAuthentication.findOne({ otp })
        if (!adminAuthentication) {
            return res.status(404).json({ message: 'Invalid OTP', status: false })
        }

        // Check if OTP is expired
        const currentTime = moment()
        const validDuration = moment(adminAuthentication.validDuration)

        if (currentTime.isAfter(validDuration)) {
            return res.status(404).json({ message: 'OTP has expired', status: false })
        }

        // Decode the user info and update the record
        const userInfo = JSON.parse(adminAuthentication.userInfo)

        await AdminAuthentication.updateOne(
            { _id: adminAuthentication._id },
            { $set: { otp: 0, validDuration: null, userInfo: null } },
            { upsert: true }
        )


        return res.status(200).json({ message: 'Login successfully!!', data: userInfo, status: true })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', status: false })
    }
}