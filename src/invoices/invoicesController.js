const { getAllInvoices,updateInvoiceStatus } = require('./invoicesServices');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

const getAllInvoicesController = async (req, res) => {
    try {
        const requests = await getAllInvoices();
        return res.json(successResponse(requests));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.message || 'Internal server error'));
    }
};

const updateInvoiceStatusController = async (req, res) => {
    try {
        const requests = await updateInvoiceStatus(req);
        return res.json(successResponse(requests));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.message || 'Internal server error'));
    }
};


module.exports = {
    getAllInvoicesController,
    updateInvoiceStatusController
};
