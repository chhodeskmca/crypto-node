const mongoose = require('mongoose');
const { ROLE_TYPES } = require('../../config');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    phoneNo: String,
    orderedHashrate: Number,
    electricitySpendings: Number,
    minPayoutAmount: Number,
    electricityExchange: Number,
    parent_id: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleType: {
        type: String,
        enum: ROLE_TYPES,
        required: true
    },
    walletAddress: String,
    walletToBeProvided: Boolean,
    created_at: Date,
    updated_at: Date,
    origin: {
        type: String,
        default: null
    },
    hasReceivedCredentials: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

userSchema.virtual('userMining', {
    ref: 'Mining',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

userSchema.virtual('userBalance', {
    ref: 'Balance',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

userSchema.virtual('userPayoutRequest', {
    ref: 'PayoutRequest',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

userSchema.virtual('userTransaction', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});

userSchema.virtual('assignedMachines', {
    ref: 'AssignedMachine',
    localField: '_id',
    foreignField: 'userId',
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// Pre-hook to delete all related data
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const userId = this._id;

    try {
        await Promise.all([
            mongoose.model('Mining').deleteMany({ userId }),
            mongoose.model('Balance').deleteMany({ userId }),
            mongoose.model('PayoutRequest').deleteMany({ userId }),
            mongoose.model('Transaction').deleteMany({ userId }),
            mongoose.model('AssignedMachine').deleteMany({ userId }),
        ]);
        next();
    } catch (err) {
        next(err);
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;
