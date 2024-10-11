const axios = require('axios')
const DefaultMining = require('../src/mining/defaultMiningModel') // Assuming you have a DefaultMining model

class MiningUtils {
    constructor() {
        this.url = process.env.NANOPOOL_URL
        this.defaultMiningId = '66d80de45059596f8f918949'
    }

    /**
     * Fetch mining data from the Nanopool API for the given hash rate
     * @param {number} orderedHashRate - The user's mining hash rate
     * @returns {Object} - Contains mining coins, dollars, and price
     */
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
                price: data.data.prices.price_usd,
            }
        } catch (error) {
            console.error('Error fetching Kaspa mining data:', error.message)
            return null
        }
    }

    /**
     * Converts Terahash to Gigahash
     * @param {number} teraHash - The hash rate in Terahash
     * @returns {number} - The equivalent hash rate in Gigahash
     */
    ordedTHsToGhs(teraHash) {
        return isNaN(teraHash) ? 0.00 : teraHash * 1000
    }

    /**
     * Adds the user's mining earnings for the current minute to the appropriate time interval arrays.
     * When an hour/day/week/month is completed, the sum is rolled up to the next interval.
     * @param {Object} userArray - The user's mining data
     * @param {number} coins - The amount of coins mined in this minute
     * @returns {Object} - Updated userArray with new earnings
     */
    addMiningKaspaToUserArray(userArray, coins) {
        try {
            const { hour, day, week, month, minsCount, hoursCount, daysCount, weekCount } = userArray

            // Update hour array with current minute's earnings
            this.updateArray(hour, coins, 60)
            let newMinsCount = minsCount + 1

            // If an hour is complete, move hourly total to day array
            let newHoursCount = hoursCount
            if (newMinsCount === 60) {
                newMinsCount = 0
                const hourTotal = this.sumArray(hour)
                this.updateArray(day, hourTotal, 24)
                newHoursCount += 1
            }

            // If a day is complete, move daily total to week array
            let newDaysCount = daysCount
            if (newHoursCount === 24) {
                newHoursCount = 0
                const dayTotal = this.sumArray(day)
                this.updateArray(week, dayTotal, 7)
                newDaysCount += 1
            }

            // If a week is complete, move weekly total to month array
            let newWeekCount = weekCount
            if (newDaysCount === 7) {
                newDaysCount = 0
                const weekTotal = this.sumArray(week)
                this.updateArray(month, weekTotal, 4) // Assuming 4 weeks in a month (for simplification)
                newWeekCount += 1
            }

            // Return updated mining data
            return {
                ...userArray,
                hour,
                day,
                week,
                month,
                minsCount: newMinsCount,
                hoursCount: newHoursCount,
                daysCount: newDaysCount,
                weekCount: newWeekCount,
            }
        } catch (error) {
            console.error('Error in addMiningKaspaToUserArray:', error.message)
            return userArray
        }
    }

    /**
     * Adds a value to an array, ensuring it does not exceed the specified limit.
     * @param {Array} arr - The array to update
     * @param {number} value - The value to add
     * @param {number} limit - The maximum length of the array
     */
    updateArray(arr, value, limit) {
        if (arr.length >= limit) arr.shift() // Remove oldest value if limit is reached
        arr.push(parseFloat(value.toFixed(6)))
    }

    /**
     * Sums all the values in the provided array.
     * @param {Array} arr - The array of numbers
     * @returns {number} - The sum of the array
     */
    sumArray(arr) {
        return arr?.reduce((acc, val) => acc + parseFloat(val), 0) || 0
    }

    /**
     * Calculates the total mining earnings for hour, day, week, and month.
     * @param {Object} mining - The mining object with the arrays and counts
     * @returns {Object} - Total earnings for each period
     */
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
    /**
 * Sums the last N elements of an array.
 * @param {Array} arr - The array of numbers.
 * @param {number} count - The number of elements to sum from the end of the array.
 * @returns {number} - The sum of the last N elements.
 */
    sumLastNElements = (arr, count) => {
        return arr?.slice(-count).reduce((acc, val) => acc + parseFloat(val), 0) || 0
    }


    /**
   * Calculates real-time mining earnings by considering only the current active values in the hour, day, week, and month arrays.
   * @param {Object} userArray - The user's mining data (hour, day, week, month, minsCount, hoursCount, etc.)
   * @returns {Object} - Object with real-time earnings for hour, day, week, and month.
   */
    calculateMiningEarnings = (userArray) => {
        try {
            const { hour, day, week, month, minsCount, hoursCount, daysCount, weekCount } = userArray

            const hourTotal = this.sumArray(hour) || 0

            // Sum the last `hoursCount` elements in the day array plus the current hour total
            const dayTotal = this.sumLastNElements(day, hoursCount) + this.sumLastNElements(hour, minsCount)

            // Sum the last `daysCount` elements in the week array plus the current day total
            const weekTotal = this.sumLastNElements(week, daysCount) + dayTotal

            // Sum the last `weekCount` elements in the month array plus the current week total
            const monthTotal = this.sumLastNElements(month, weekCount) + weekTotal

            // Return the real-time earnings for each interval
            return {
                hour: parseFloat(hourTotal.toFixed(3)),
                day: parseFloat(dayTotal.toFixed(3)),
                week: parseFloat(weekTotal.toFixed(3)),
                month: parseFloat(monthTotal.toFixed(3)),
            }
        } catch (error) {
            console.error('Error in calculateMiningEarnings:', error.message)
            return { hour: 0, day: 0, week: 0, month: 0 }
        }
    }

    /**
     * Gets the default mining data or uses fallback values if unavailable.
     * @returns {Object} - Default mining data with minimum and maximum values
     */
    async getDefaultMiningData(orderedHashRate) {
        try {
            const defaultMining = await DefaultMining.findById(this.defaultMiningId)
            const minimum = defaultMining ? defaultMining.minimum : 23
            const maximum = defaultMining ? defaultMining.maximum : 27

            const kaspa = (Math.random() * (maximum - minimum) + minimum) / 24 / 60

            return {
                coins: kaspa * orderedHashRate,
                dollars: "0.47944015812997",
                price: '0.47944015812997'
            }

        } catch (error) {
            console.error('Error fetching default mining data:', error.message)
            const minimum = 23
            const maximum = 27

            const kaspa = (Math.random() * (maximum - minimum) + minimum) / 24 / 60

            return {
                coins: kaspa * orderedHashRate,
                dollars: "0.47944015812997",
                price: '0.47944015812997'
            }
        }
    }

    /**
     * Gets the daily Kaspa mining earnings, applying default values if needed.
     * @param {number} kaspa - Kaspa earnings for the current minute
     * @param {number} orderedHashRate - User's hash rate
     * @returns {number} - Daily Kaspa earnings
     */
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