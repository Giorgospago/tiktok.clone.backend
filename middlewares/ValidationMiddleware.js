
try {
    const {validationResult} = require("express-validator")

    const ValidationResult = (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(422)
                .json({
                    errors: errors.array()
                });
        }
        next();
    }

    module.exports = {
        ValidationResult
    };
} catch (e) {
    console.log(e);
}