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

exports.storeOrUpdate = async (req, res, id = null) => {
    try {
        const { title, description, status } = req.body;

        // Prepare file path if image is uploaded
        let imagePath = '';
        if (req.file) {
            imagePath = 'notifications/' + req.file.filename;
        }

        if (id) {
            // Update existing notification
            const notification = await Notification.findById(id);
            if (!notification) {
                return { status: 404, data: { status: false, message: 'Notification not found' } };
            }

            notification.title = title;
            notification.description = description;
            notification.status = status === 'true' || status === '1';
            if (imagePath) {
                notification.image = imagePath;
            }

            await notification.save();
            return { status: 200, data: { status: true, message: 'Notification updated successfully' } };
        } else {
            // Create new notification
            const newNotification = new Notification({
                title,
                description,
                status: status === 'true' || status === '1',
                image: imagePath
            });

            await newNotification.save();
            return { status: 201, data: { status: true, message: 'Notification created successfully' } };
        }
    } catch (error) {
        return { status: 500, data: { status: false, message: error.message } };
    }
};
