const express = require('express')
const router = express.Router()
const { getAllMachinesController, createMachineController, updateMachineController, assignMachineController, unassignMachineController, deleteMachineController } = require('./machineController')
const authenticateToken = require('../../middleware/authMiddleware')
const handleValidationErrors = require('../../middleware/validationMiddleware')
const upload = require('../../middleware/uploadMiddleware')


const {
    createOrUpdateMachineValidation,
    assignMachineValidation,
    unassignMachineValidation
} = require('../../validators/machineValidator')

// Get All Machines
router.get('/machines/all', authenticateToken, getAllMachinesController)

// Create Machine
router.post('/machine/create',
    authenticateToken,
    upload.single('image'),
    createOrUpdateMachineValidation,
    handleValidationErrors,
    createMachineController
)

// Update Machine
router.post('/machine/update',
    authenticateToken,
    upload.single('image'),
    createOrUpdateMachineValidation,
    handleValidationErrors,
    updateMachineController
)

// Assign Machine
router.post('/machine/assign',
    authenticateToken,
    assignMachineValidation,
    handleValidationErrors,
    assignMachineController
)

// Unassign Machine
router.post('/machine/unassign',
    authenticateToken,
    unassignMachineValidation,
    handleValidationErrors,
    unassignMachineController
)

// Delete Machine
router.delete('/machine/delete/:machineId', authenticateToken, deleteMachineController)

module.exports = router