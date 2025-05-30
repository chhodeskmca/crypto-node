const CalculationReport = require('./reportModel')
const { sendEmail } = require('./sendReportMail');
const path = require('path');
exports.calculationReport = async (req, res) => {
    try {
        // 
        const data = req.body;
        await sendEmail('chhabra.odesk.mca@gmail.com', 'Welcome!', { name: data.name, message: 'Thanks for registering!' });
        console.log('please check');
        //const report = await CalculationReport.create(data);
        return;
        res.status(201).json({
            message: 'Calculation report created successfully',
            report
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
