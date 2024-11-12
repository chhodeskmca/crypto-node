const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Function to ensure folder exists
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderType = req.body.folderType || ''
        const dir = `public/images/${folderType}`

        // Ensure the target folder exists
        ensureDirectoryExistence(dir)
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|jpeg|png|svg/
        const mimetype = filetypes.test(file.mimetype)
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        if (mimetype && extname) {
            return cb(null, true)
        }
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed.'))
    }
})

module.exports = upload