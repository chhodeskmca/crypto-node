const MiningServices = require('./miningService')
const { validationResult } = require('express-validator')
const moment = require('moment')

// Controller for updating default mining
exports.updateDefaultMiningController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await MiningServices.updateDefaultMining(req)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for getting default mining
exports.getDefaultMiningController = async (req, res) => {
    try {
        const result = await MiningServices.getDefaultMining(req)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for getting user earnings
exports.getUserEarningsController = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    try {
        const result = await MiningServices.getUserEarnings(req)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Controller for getting current hash rate
exports.minePerMinuteController = async (req, res) => {
    try {
        const result = await MiningServices.minePerMinute(req)
        console.log(`Mining completed at ${moment().format('YYYY-MM-DD HH:mm:ss ZZ')}`)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}