const { body } = require('express-validator')

const updateDefaultMiningValidation = [
    body('minimum')
        .isNumeric()
        .withMessage('Minimum value is required and should be a number'),
    body('maximum')
        .isNumeric()
        .withMessage('Maximum value is required and should be a number')
]

const getUserEarningsValidation = [
    body('userId')
        .isString()
        .withMessage('User ID is required and should be a valid string')
]

module.exports = {
    updateDefaultMiningValidation,
    getUserEarningsValidation
}