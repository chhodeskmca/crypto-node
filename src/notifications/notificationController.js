const Notification = require('./notificationModel');
const path = require('path');

exports.getAll = async (req, res, next) => {
    try {
        const notification = await Notification.findOne().sort({ created_at: -1 });

        if (!notification) {
            return res.status(404).json({ status: false, message: 'No notifications found' });
        }

        return res.status(200).json({ status: true, data: notification });
    } catch (error) {
        next(error); // Pass the error to the next middleware (error handler)
    }
};

exports.storeOrUpdate = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        // Prepare file path if image is uploaded
        let imagePath = '';
        if (req.file) {
            imagePath = 'images/notifications/' + req.file.filename;
        }

        // Check if there's at least one record in the database
        const existingNotification = await Notification.findOne();

        if (existingNotification) {
            existingNotification.title = title;
            existingNotification.description = description;
            existingNotification.status = status === 'true' || status === '1';
            if (imagePath) {
                existingNotification.image = imagePath;
            }

            await existingNotification.save();
            return res.status(200).json({ status: true, message: 'Notification updated successfully' });
        } else {
            const newNotification = new Notification({
                title,
                description,
                status: status === 'true' || status === '1',
                image: imagePath
            });

            await newNotification.save();
            return res.status(201).json({ status: true, message: 'Notification created successfully' });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};