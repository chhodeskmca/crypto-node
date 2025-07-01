const { Invoice } = require("../calculation-report/reportModel");

exports.getAllInvoices = async (req) => {
    const invoices = await Invoice.find().sort({ created_at: -1 })

    if (invoices.length === 0) {
        throw new Error('No invoice found')
    }

    return { status: true, data: invoices }
};

exports.updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Invoice ID is required' });
    }

    try {
        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        return { message: 'Invoice status updated to completed' }
    } catch (error) {
        throw new Error(error.message);
    }
};
