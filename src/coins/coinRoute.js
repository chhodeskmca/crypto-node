const express = require('express')
const router = express.Router()

// Importing controller handler
const coinController = require('./coinController')

// Importing middlewares
const authenticateToken = require('../../middleware/authMiddleware')
const upload = require('../../middleware/uploadMiddleware')


// Define routes
router.post(
    '/coin/create',
    upload.single('image'),
    authenticateToken,
    coinController.createCoin
)

router.get(
    '/coins/all',
    authenticateToken,
    coinController.getAllCoins
)
router.get(
    '/coin/:id',
    authenticateToken,
    coinController.getCoinById
)


router.put(
    '/coin/update/:id',
    upload.single('image'),
    authenticateToken,
    coinController.updateCoin
)
router.delete('/coin/delete/:id', authenticateToken, coinController.deleteCoin)

module.exports = router