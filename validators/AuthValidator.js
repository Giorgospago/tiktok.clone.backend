const {check} = require("express-validator");
const {ValidationResult} = require("../middlewares/ValidationMiddleware");

const login = [
    check('email')
        .exists().withMessage('Email is required field')
        .isEmail().withMessage('This is not an email'),
    check("password")
        .exists().withMessage('Password is required field')
        .isLength({min: 5}).withMessage('Password has a minimum length of 5 characters'),
    ValidationResult
];

const register = [
    check('name')
        .exists().withMessage('Name is required field')
        .isString().withMessage('Name has to be string'),
    check('email')
        .exists().withMessage('Email is required field')
        .isEmail().withMessage('This is not an email'),
    check("password")
        .exists().withMessage('Password is required field')
        .isLength({min: 5}).withMessage('Password has a minimum length of 5 characters'),
    ValidationResult
];

module.exports = {
    login,
    register
};
