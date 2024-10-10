function successResponse(data, message = 'Operation successful') {
    return {
        status: true,
        data: data,
        message: message
    };
}

function errorResponse(message, statusCode = 500) {
    return {
        status: false,
        message: message,
        statusCode: statusCode
    };
}

module.exports = {
    successResponse,
    errorResponse
};
