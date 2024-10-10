const Setting = require('./settingModel');
const AdminAuthentication = require('../authentication/adminAuthenticationModel');

exports.update = async (req, res) => {
    try {
        const { performanceSettings } = req.body;

        let performanceSettingsRecord = await Setting.findOne({ name: 'More performance settings' });

        // Update performance settings
        if (performanceSettingsRecord && performanceSettingsRecord.value !== performanceSettings) {
            performanceSettingsRecord.value = performanceSettings;
            await performanceSettingsRecord.save();
        }

        // Optionally fetch the updated settings to return in the response
        const updatedSettings = await Setting.find();
        res.status(200).json({ status: true, data: updatedSettings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStatus = async (req) => {
    try {
        const { twoFactorAuthentication } = req.body;

        // Retrieve the settings from the database (findOne() to get a single document)
        let twoFactorSetting = await AdminAuthentication.findOne().exec();

        // Check if the settings document exists and update it
        if (twoFactorSetting) {
            twoFactorSetting.authenticationEnabled = !!twoFactorAuthentication; // Convert to boolean
            await twoFactorSetting.save();
        } else {
            // If no settings document is found, create a new one
            twoFactorSetting = new AdminAuthentication({ authenticationEnabled: !!twoFactorAuthentication });
            await twoFactorSetting.save();
        }

        return { status: true, message: 'Settings updated successfully' };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

exports.get = async () => {
    try {
        const twoFactorSetting = await AdminAuthentication.find().exec()
        const settings = await Setting.find().exec()

        const data = {
            settings: settings.length ? settings[0].value : null,
            twoFactorSetting: twoFactorSetting.length ? twoFactorSetting[0].authenticationEnabled : false
        }

        if (data.settings || data.twoFactorSetting) {
            return { status: true, data, message: 'Settings fetched successfully' }
        } else {
            return { status: false, message: 'No settings found' }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}
