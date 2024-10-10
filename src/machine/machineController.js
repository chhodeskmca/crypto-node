const {
    getAllMachines,
    createMachine,
    updateMachine,
    assignMachine,
    unassignMachine,
    deleteMachine
} = require('./machineServices')
const { validationResult } = require('express-validator')

// Controller for getting all machines
exports.getAllMachinesController = async (req, res) => {
    try {
        const result = await getAllMachines()
        res.status(200).json(result)
    } catch (error) {
        res.status(404).json({ status: false, message: error.message })
    }
}

// Controller for creating a machine
exports.createMachineController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await createMachine(req.body, req.file)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

// Controller for updating a machine
exports.updateMachineController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await updateMachine(req.body.machineId, req.body, req.file)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

// Controller for assigning a machine to a user
exports.assignMachineController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await assignMachine(req.body)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

// Controller for unassigning a machine from a user
exports.unassignMachineController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await unassignMachine(req.body.id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}

// Controller for deleting a machine
exports.deleteMachineController = async (req, res) => {
    try {
        const result = await deleteMachine(req.params.machineId)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
}