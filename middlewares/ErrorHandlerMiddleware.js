const errorHandlerMiddleware = async (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || 500,
        message: err.message || 'Something went wrong, please try again later..'
    };

    console.log({error: customError.message});
    return res.status(customError.statusCode).json({message: customError.message});
};

module.exports = errorHandlerMiddleware;