const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

exports.customError = ({ code = 500, message = "Internal server error" }) => {
    const error = new Error()
    error.statusCode = code
    error.message = message
    return error
}

exports.encryptPassword = (password) => {
    if (!secretKey || Buffer.from(secretKey).length !== 32) {
        throw new Error('ENCRYPTION_KEY must be 32 bytes long');
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(password);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    };
};

exports.decryptPassword = (encryptedText, ivHex) => {
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(encryptedText, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// exports.isUserCreatedWithin30Days = (user) =>{

//     console.log(user, "user");

//     if ((!user )|| (!user.created_at) || (!user.createdAt)) {
//         throw new Error('Invalid user object');
//     }

//     const createdAt = (new Date(user.created_at)) || (new Date(user.createdAt));
//     const now = new Date();

//     const diffInMs = now.getTime() - createdAt.getTime();
//     const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

//     return diffInDays <= 30;
// }

exports.isUserCreatedWithin30Days = (user) => {
    if (!user) {
        throw new Error('Invalid user object');
    }

    const createdAtValue = user.created_at || user.createdAt;

    if (!createdAtValue) {
        throw new Error('createdAt not found on user');
    }

    const createdAt = new Date(createdAtValue);

    if (isNaN(createdAt.getTime())) {
        throw new Error('Invalid createdAt date');
    }

    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays <= 30;
};
