const { Machine, AssignedMachine } = require('./machineModel')
const User = require('../users/userModel')
const Mining = require('../mining/miningModel')
const { ObjectId } = require('../../config/db')
const Coin = require('../coins/coinModel')

// Service function for getting all machines
exports.getAllMachines = async (req) => {
    const coinId = req.coinId
    const machines = await Machine.find({ coinId }).sort({ created_at: -1 })

    if (machines.length === 0) {
        throw new Error('No machines found')
    }

    return { status: true, data: machines }
}

// Service function for creating a machine
exports.createMachine = async (req, file) => {
    const coinId = req.coinId
    const { name, websiteUrl, specHashrate, specElectricitySpending } = req.body

    const machine = new Machine({
        name,
        coinId,
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
exports.assignMachine = async (req) => {
    const coinId = req.coinId
    const { userId, machineId, hashrate, performance, electricitySpending } = req.body


    const mining = await Mining.findOne({ userId: new ObjectId(userId), coinId })
    const coin = await Coin.findById(coinId)

    if (!mining) {
        throw new Error(`Please assign the ${coin.name} coin to this user first before proceeding!`)
    }

    mining.settings.orderedHashrate += parseFloat(hashrate)
    mining.settings.electricitySpendings += parseFloat(electricitySpending)
    await mining.save()

    const assignedMachine = new AssignedMachine({
        userId,
        coinId,
        machineId,
        hashrate,
        performance,
        electricitySpending
    })

    await assignedMachine.save()

    return { status: true, message: 'Machine assigned successfully' }
}

// Service function for unassigning a machine from a user
exports.unassignMachine = async (req) => {

    const assignedMachine = await AssignedMachine.findById(req.body.id)
    if (!assignedMachine) {
        throw new Error('Assigned machine not found')
    }

    const mining = await Mining.findOne({
        userId: assignedMachine.userId,
        coinId: assignedMachine.coinId
    })
    if (!mining) {
        throw new Error('User not found')
    }

    mining.settings.orderedHashrate -= parseFloat(assignedMachine.hashrate)
    mining.settings.electricitySpendings -= parseFloat(assignedMachine.electricitySpending)
    await mining.save()

    await AssignedMachine.findByIdAndDelete(req.body.id)
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