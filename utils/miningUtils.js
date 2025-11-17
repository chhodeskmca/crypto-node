const axios = require('axios')
const DefaultMining = require('../src/default-mining/defaultMiningModel') // Assuming you have a DefaultMining model
const moment = require('moment')
class MiningUtils {
    constructor() {
        this.url = process.env.COINGENKO_URL || 'https://api.coingecko.com/api/v3'
        this.defaultMiningId = '66d80de45059596f8f918949'
    }

    async getCurrentKaspaPrice() {
        try {
            console.log('Fetching current Kaspa price from API...')
            const { data } = await axios.get(`${this.url}/simple/price?ids=kaspa&vs_currencies=usd`)
            if (!data.kaspa?.usd) {
                console.error('API response kaspa usd not found:', data)
                return { price: 0.135438 }
            }

            return {
                price: data?.kaspa?.usd,
            }
        } catch (error) {
            console.error('Error while fetching Kaspa price:', error.message)
            return { price: 0.135438 }
        }
    }

    async fetchPerMinuteKaspaMining(orderedHashRate) {
        try {
            const { data } = await axios.get(`${this.url}/approximated_earnings/${orderedHashRate}`)
            if (!data.status) {
                console.error('API response status is false:', data)
                return null
            }

            const kaspa = await this.getDayKaspaMining(data.data.minute.coins, orderedHashRate)

            return {
                coins: kaspa,
                dollars: data.data.minute.dollars,
                price: (await this.getCurrentKaspaPrice()).price,
            }
        } catch (error) {
            console.error('Error fetching Kaspa mining data:', error.message)
            return null
        }
    }

    ordedTHsToGhs(teraHash) {
        return isNaN(teraHash) ? 0.00 : teraHash * 1000
    }

    addMiningKaspaToUserArray(userArray, coins) {
        try {
            const { hour, earnings = [], minsCount } = userArray

            // Update hour array with current minute's earnings
            this.updateArray(hour, coins, 60)
            let newMinsCount = minsCount + 1

            if (newMinsCount === 60) {
                newMinsCount = 0
                const hourTotal = this.sumArray(hour)
                this.updateArray(earnings, hourTotal, 720, true)
            }

            return {
                ...userArray,
                hour,
                earnings,
                minsCount: newMinsCount
            }
        } catch (error) {
            console.error('Error in addMiningKaspaToUserArray:', error)
            return userArray
        }
    }

    updateArray(arr, value, limit, date = false) {
        if (arr.length >= limit) arr.shift()
        if (!date) arr.push(parseFloat(value.toFixed(6)))
        if (date) arr.push({ time: moment().format(), amount: parseFloat(value.toFixed(6)) })
    }

    sumArray(arr) {
        return arr?.reduce((acc, val) => acc + parseFloat(val), 0) || 0
    }

    calculateMining(mining) {
        try {
            const hourTotal = this.sumArray(mining?.hour) || 0
            const dayTotal = this.sumArray(mining?.day) + hourTotal || 0
            const weekTotal = this.sumArray(mining?.week) + dayTotal || 0
            const monthTotal = this.sumArray(mining?.month) + weekTotal || 0

            return { hour: hourTotal, day: dayTotal, week: weekTotal, month: monthTotal }
        } catch (error) {
            console.error('Error in calculateMining:', error.message)
            return {}
        }
    }

    sumLastNElements = (arr, count) => {
        return arr?.slice(-count).reduce((acc, val) => acc + parseFloat(val), 0) || 0
    }

    async calculateMiningEarnings(userEarnings, kaspaBalance) {
        try {
            const { hour, earnings, minsCount } = userEarnings

            const hourTotal = this.sumArray(hour) || 0

            const dayTotal = getLast24HoursEarnings(earnings, hour, minsCount, kaspaBalance)
            const weekTotal = getLast7DaysEarnings(earnings, hour, minsCount, kaspaBalance)
            const monthTotal = getLast30DaysEarnings(earnings, hour, minsCount, kaspaBalance)

            return {
                hour: parseFloat(hourTotal.toFixed(6)),
                day: parseFloat(dayTotal.toFixed(6)),
                week: parseFloat(weekTotal.toFixed(6)),
                month: parseFloat(monthTotal.toFixed(6)),
            };
        } catch (error) {
            console.error('Error in calculateMiningEarnings:', error)
            return { hour: 0, day: 0, week: 0, month: 0 }
        }
    }

    async getDefaultMiningData(orderedHashRate, currentPrice) {

        try {
            const defaultMining = await DefaultMining.findOne().exec()
            const minimum = defaultMining ? defaultMining.minimum : 11
            const maximum = defaultMining ? defaultMining.maximum : 17

            const kaspa = (Math.random() * (maximum - minimum) + minimum) / 24 / 60


            return {
                coins: kaspa * orderedHashRate,
                dollars: currentPrice,
                price: currentPrice
            }

        } catch (error) {
            console.error('Error fetching default mining data:', error.message)
            const minimum = 11
            const maximum = 17

            const kaspa = (Math.random() * (maximum - minimum) + minimum) / 24 / 60

            return {
                coins: kaspa * orderedHashRate,
                dollars: currentPrice,
                price: currentPrice
            }
        }
    }

    async getDayKaspaMining(kaspa, orderedHashRate) {
        try {
            const defaultMining = await this.getDefaultMiningData()
            const total = kaspa * 60 * 24

            if (total < defaultMining.minimum) {
                kaspa = Math.random() * (defaultMining.maximum - defaultMining.minimum) + defaultMining.minimum
            }

            return kaspa * orderedHashRate
        } catch (error) {
            console.error('Error in getDayKaspaMining:', error.message)
            return 0
        }
    }
}

module.exports = MiningUtils









function sumLastXHours(earningsArray, numHours) {
    return earningsArray
        .slice(-numHours)
        .reduce((sum, entry) => sum + entry.amount, 0)
}


function sumExtraMinutes(hourArray, minutesCount) {
    return hourArray
        .slice(0, minutesCount)
        .reduce((sum, amount) => sum + amount, 0)
}


function getLast24HoursEarnings(earnings, hour, minsCount, kaspaBalance) {
    const day = 24
    const last24HoursEarnings = sumLastXHours(earnings, day)
    const extraMinutesEarnings = sumExtraMinutes(hour, minsCount)
    return earnings.length < day ? kaspaBalance : last24HoursEarnings
}


function getLast7DaysEarnings(earnings, hour, minsCount, kaspaBalance) {
    const week = 168
    const last168HoursEarnings = sumLastXHours(earnings, 168)
    const extraMinutesEarnings = sumExtraMinutes(hour, minsCount)
    return earnings.length < week ? kaspaBalance : last168HoursEarnings
}


function getLast30DaysEarnings(earnings, hour, minsCount, kaspaBalance) {
    const month = 720
    const last720HoursEarnings = sumLastXHours(earnings, month)
    const extraMinutesEarnings = sumExtraMinutes(hour, minsCount)
    return earnings.length < month ? kaspaBalance : last720HoursEarnings
}