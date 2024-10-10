exports.customError = ({ code = 500, message = "Internal server error" }) => {
    const error = new Error()
    error.statusCode = code
    error.message = message
    return error
}