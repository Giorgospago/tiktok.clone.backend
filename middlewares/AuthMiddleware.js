const jwt = require('jsonwebtoken');

const isAuthorized = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.json({
            success: false,
            message: "There is no Authorization header"
        });
    }

    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return res.json({
            success: false,
            message: "Invalid JWT"
        });
    }

    req.token = token;
    req.user = decoded.user;
    next();
};

module.exports = {
    isAuthorized
};
