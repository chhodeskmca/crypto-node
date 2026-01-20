const UserServices = require('./userServices')
const { validationResult } = require('express-validator')

// Controller for user creation
exports.createUserController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        await UserServices.createUser(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for user login
exports.loginController = async (req, res) => {
    try {
        const data = await UserServices.login(req, res)
        res.status(200).json({ data, status: true })
    } catch (error) {
        console.log('error:', error.message)
        res.status(401).json({ error: error.message })
    }
}

// Controller for getting all users
exports.getAllUsersController = async (req, res) => {
    try {
        const users = await UserServices.getAllUsers(req)
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// Controller for getting all users
exports.fetchAdminUsersByParentIdController = async (req, res) => {
    try {
        const users = await UserServices.fetchAdminUsersByParentId(req)
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// Controller for getting a single user info
exports.getUserInfoController = async (req, res) => {
    try {
        await UserServices.getUserInfo(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for updating a user
exports.updateUserController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const userId = req.params.userId
        const updatedUser = await UserServices.updateUser(req.body, userId)
        res.status(200).json({ message: `${req.body.isAdmin ? 'Admin' : 'User'} updated successfully.`, user: updatedUser, status: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for updating a password
exports.updatePasswordController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        await UserServices.updatePassword(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for deleting a user
exports.deleteUserController = async (req, res) => {
    try {
        const userId = req.params.userId
        await UserServices.deleteUser(userId)
        res.status(200).json({ message: 'User and related data deleted successfully', status: true })
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message })
    }
}

// Controller for updating user's minimum payout amount
exports.updateUserMinPayoutAmountController = async (req, res) => {
    try {
        const { userId } = req.params
        const { minPayoutAmount } = req.body

        const result = await UserServices.updateUserMinPayoutAmount(userId, minPayoutAmount)

        return res.status(result.statusCode).json(result.data)
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}

// Controller for getting user's minimum payout amount
exports.getMinPayoutAmountController = async (req, res) => {
    try {
        await UserServices.getMinPayoutAmount(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for admin two-factor authentication
exports.adminTwoFactorAuthenticationController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
    }

    try {
        await UserServices.adminTwoFactorAuthentication(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.newUserVerifiedModalStatus = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
    }

    try {
        await UserServices.newUserVerifiedModalStatus(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.checkNewUserVerifyModalStatus = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ error: errors.array()[0].msg })
    }

    try {
        await UserServices.checkNewUserVerifyModalStatus(req, res)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}