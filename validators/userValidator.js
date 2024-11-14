const { body } = require('express-validator')


const updateUserValidation = [
    body('name').isString().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('walletAddress').isString().withMessage('Wallet address is required'),
]

const updatePasswordValidation = [
    body('oldPassword').isString().withMessage('Old password is required'),
    body('newPassword').isString().withMessage('New password is required'),
]

const adminTwoFactorValidation = [
    body('otp').isString().withMessage('OTP is required'),
]

module.exports = {
    updateUserValidation,
    updatePasswordValidation,
    adminTwoFactorValidation
}