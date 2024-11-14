const express = require('express')
const router = express.Router()
const UserController = require('./userController')
const authenticateToken = require('../../middleware/authMiddleware')

// Import validation rules from the validators directory
const Validations = require('../../validators/userValidator')
const originCheckMiddleware = require('../../middleware/originCheckMiddleware')

// Public Routes
router.post(
    '/login',
    originCheckMiddleware,
    UserController.loginController)

// Protected Routes
router.get(
    '/users/all',
    authenticateToken,
    UserController.getAllUsersController
)

// Protected Routes
router.get(
    '/admins/:id',
    authenticateToken,
    UserController.fetchAdminUsersByParentIdController
)

router.post(
    '/user/create',
    authenticateToken,
    UserController.createUserController
)

router.get(
    '/user/:userId',
    authenticateToken,
    UserController.getUserInfoController
)

router.put(
    '/users/:userId',
    authenticateToken,
    Validations.updateUserValidation, UserController.updateUserController
)

router.post(
    '/users/update-password',
    authenticateToken,
    Validations.updatePasswordValidation, UserController.updatePasswordController
)

router.delete(
    '/users/:userId',
    authenticateToken,
    UserController.deleteUserController
)

router.put(
    '/users/:userId/updateMinPayoutAmount',
    authenticateToken,
    UserController.updateUserMinPayoutAmountController
)

router.get(
    '/users/:userId/minPayoutAmount',
    authenticateToken,
    UserController.getMinPayoutAmountController
)

router.post(
    '/admin/authentication',
    Validations.adminTwoFactorValidation,
    UserController.adminTwoFactorAuthenticationController
)

module.exports = router