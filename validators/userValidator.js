const { body } = require('express-validator')

const createUserValidation = [
    body('name').isString().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('walletAddress').isString().withMessage('Wallet address is required'),
    body('password')
        .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()-_=+])(?=.*[a-z]).{6,16}$/)
        .withMessage('Password must contain at least one uppercase letter, one special character, and be between 6 and 16 characters long'),
]

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
    createUserValidation,
    updateUserValidation,
    updatePasswordValidation,
    adminTwoFactorValidation
}