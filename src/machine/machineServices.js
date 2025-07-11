const crypto = require('crypto');
const bcrypt = require("bcryptjs")
const { Machine, AssignedMachine } = require('./machineModel')
const User = require('../users/userModel')
const Mining = require('../mining/miningModel')
const { ObjectId } = require('../../config/db')
const Coin = require('../coins/coinModel')
const { sendEmail } = require('./sendEmail');
const { decryptPassword } = require("../../utils/helper")

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
    const coinId = req.coinId;
    const { userId, machineId, hashrate, performance, electricitySpending } = req.body;

    // Step 1: Try updating the Mining record if it exists
    const mining = await Mining.findOne({ userId: new ObjectId(userId), coinId });
    const coin = await Coin.findById(coinId);

    if (!mining) {
        throw new Error(`Please assign the ${coin?.name || 'selected'} coin to this user first before proceeding!`);
    }

    mining.settings.orderedHashrate += parseFloat(hashrate);
    mining.settings.electricitySpendings += parseFloat(electricitySpending);
    await mining.save();

    // Step 2: Update the User record
    let user = await User.findById(userId).select('+isNewUser +encryptedPassword +encryptionIv');
    if (!user) {
        throw new Error('User does not exist');
    }

    user.orderedHashrate += parseFloat(hashrate);
    user.electricitySpendings += parseFloat(electricitySpending);

    // Step 3: Handle new user welcome email
    if (user.isNewUser) {
        const originalPassword = decryptPassword(user.encryptedPassword, user.encryptionIv);

        const url = process.env.NODE_ENV === 'DEV'
            ? 'http://localhost:5173/login'
            : 'https://api.mrcryptomining.com/login';

        await sendEmail(
            user.email,
            'Your Crypto Mining Account Details',
            {
                name: user.name,
                email: user.email,
                password: originalPassword,
                year: new Date().getFullYear(),
                url
            },
            'userEmail.html',
            true
        );

        user.isNewUser = false;
    }

    await user.save();

    // Step 4: Assign the machine
    const assignedMachine = new AssignedMachine({
        userId,
        coinId,
        machineId,
        hashrate,
        performance,
        electricitySpending
    });

    await assignedMachine.save();

    return { status: true, message: 'Machine assigned successfully' };
};

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

