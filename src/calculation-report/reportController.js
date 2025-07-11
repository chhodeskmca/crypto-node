const { Invoice, CalculationReport } = require('./reportModel')
const { sendEmail } = require('./sendReportMail');
const path = require('path');
exports.calculationReport = async (req, res) => {
    try {
        const data = req.body;
        const calculation = generateCalculation(data);
        await sendEmail(data.email, 'Your Mining Calculation Report', calculation);
        const report = await CalculationReport.create({ ...data, calculation });

        res.status(200).json({
            status: true,
            message: 'Calculation report created and emailed successfully',
            report
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sendInvoice = async (req, res) => {
    const { email, name, amount, spending, electricityPrice } = req.query;
    try {
        await Invoice.create({ email, name, status: 'pending' });
        await sendEmail(
            email,
            'Invoice from Mr.Crypto Mining',
            {
                name,
                amount,
                spending, electricityPrice,
                date: new Date().toISOString().split('T')[0]
            },
            'invoiceEmail.html',
            true
        );

        res.sendFile(path.join(__dirname, 'emailTemplates', 'invoiceSuccess.html'));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


function generateCalculation(data) {
    const today = new Date().toISOString().split('T')[0];
    const baseUrl = process.env.NODE_ENV === 'DEV'
        ? 'http://localhost:3000'
        : 'https://api.mrcryptomining.com';

    const invoiceLink = `${baseUrl}/api/send-invoice?email=${data.email}&name=${data.name}&amount=${data.investmentAmount}&electricityPrice=${data.electricityPrice}&spending=${data.spending}`;

    return {
        name: data.name,
        email: data.email,
        investmentAmount: data.investmentAmount,
        spending: data.spending,
        electricityPrice: data.electricityPrice,
        invoiceLink: invoiceLink,
        date: today,
        hardware: `KS5 PRO 114th/s ${data.specifications}kw`,
        kwRate: 0.06,
        terms: 'General T&Cs apply until EOB ' + today,
    };
}