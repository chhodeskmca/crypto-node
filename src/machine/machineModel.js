const mongoose = require('mongoose');

// Machine Schema
const machineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    coinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coin',
        required: true
    },
    websiteUrl: {
        type: String,
        required: true
    },
    performance: {
        type: String,
        default: '100'
    },
    specHashrate: {
        type: Number,
        required: true
    },
    specElectricitySpending: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// AssignedMachine Schema
const assignedMachineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coin',
        required: true
    },
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: true
    },
    hashrate: {
        type: String,
        required: true
    },
    performance: {
        type: String,
        required: true
    },
    electricitySpending: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

assignedMachineSchema.virtual('machine', {
    ref: 'Machine',
    localField: 'machineId',
    foreignField: '_id',
    justOne: true,
});
const Machine = mongoose.model('Machine', machineSchema);
const AssignedMachine = mongoose.model('AssignedMachine', assignedMachineSchema);

module.exports = { Machine, AssignedMachine };
