const { body } = require('express-validator');

const createOrUpdateMachineValidation = [
    body('name').isString().withMessage('Name is required'),
    body('websiteUrl').isString().withMessage('Website URL is required'),
    body('specHashrate').isNumeric().withMessage('Hashrate should be numeric'),
    body('specElectricitySpending').isNumeric().withMessage('Electricity Spending should be numeric')
];

const assignMachineValidation = [
    body('userId').isString().withMessage('User ID is required'),
    body('machineId').isString().withMessage('Machine ID is required'),
    body('hashrate').isString().withMessage('Hashrate is required'),
    body('performance').isString().withMessage('Performance is required'),
    body('electricitySpending').isString().withMessage('Electricity Spending is required')
];

const unassignMachineValidation = [
    body('id').isString().withMessage('Assigned machine ID is required')
];

module.exports = {
    createOrUpdateMachineValidation,
    assignMachineValidation,
    unassignMachineValidation
};