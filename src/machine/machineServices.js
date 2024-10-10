const { Machine, AssignedMachine } = require('./machineModel')
const User = require('../users/userModel')

// Service function for getting all machines
exports.getAllMachines = async () => {
    const machines = await Machine.find().sort({ created_at: -1 })

    if (machines.length === 0) {
        throw new Error('No machines found')
    }

    return { status: true, data: machines }
}

// Service function for creating a machine
exports.createMachine = async (machineData, file) => {
    const { name, websiteUrl, specHashrate, specElectricitySpending } = machineData

    const machine = new Machine({
        name,
        websiteUrl,
        performance: '100',
        specHashrate,
        specElectricitySpending,
        image: file ? file.path?.replace('public/', '') : null
    })

    await machine.save()
    return { status: true, message: 'Machine created successfully' }
}

// Service function for updating a machine
exports.updateMachine = async (machineId, machineData, file) => {
    const { name, websiteUrl, performance, specHashrate, specElectricitySpending } = machineData

    const machine = await Machine.findById(machineId)

    if (!machine) {
        throw new Error('Machine not found')
    }

    machine.name = name
    machine.websiteUrl = websiteUrl
    machine.performance = performance
    machine.specHashrate = specHashrate
    machine.specElectricitySpending = specElectricitySpending

    if (file) {
        machine.image = file.path?.replace('public/', '')
    }

    await machine.save()
    return { status: true, message: 'Machine updated successfully' }
}

// Service function for assigning a machine to a user
exports.assignMachine = async (machineData) => {
    const { userId, machineId, hashrate, performance, electricitySpending } = machineData

    const user = await User.findById(userId)
    if (!user) {
        throw new Error('User does not exist')
    }

    user.orderedHashrate += parseFloat(hashrate)
    user.electricitySpendings += parseFloat(electricitySpending)
    await user.save()

    const assignedMachine = new AssignedMachine({
        userId,
        machineId,
        hashrate,
        performance,
        electricitySpending
    })

    await assignedMachine.save()

    return { status: true, message: 'Machine assigned successfully' }
}

// Service function for unassigning a machine from a user
exports.unassignMachine = async (id) => {
    const assignedMachine = await AssignedMachine.findById(id)
    if (!assignedMachine) {
        throw new Error('Assigned machine not found')
    }

    const user = await User.findById(assignedMachine.userId)
    if (!user) {
        throw new Error('User not found')
    }

    user.orderedHashrate -= parseFloat(assignedMachine.hashrate)
    user.electricitySpendings -= parseFloat(assignedMachine.electricitySpending)
    await user.save()

    await AssignedMachine.findByIdAndDelete(id)
    return { status: true, message: 'Machine unassigned successfully' }
}

// Service function for deleting a machine
exports.deleteMachine = async (machineId) => {
    const assignedMachines = await AssignedMachine.find({ machineId }).populate('user')
    const users = assignedMachines.map(am => am.user.email)

    if (users.length > 0) {
        return {
            status: false,
            message: `This machine is assigned to these users: ${users.join(', ')}. Please unassign it before deleting.`
        }
    }

    await Machine.findByIdAndDelete(machineId)
    return { status: true, message: 'Machine deleted successfully' }
}