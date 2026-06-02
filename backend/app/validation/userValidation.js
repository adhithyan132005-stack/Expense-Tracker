const Joi = require('joi');

// Validation schema for user registration
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required().messages({
            'string.base': 'Username must be a string',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 30 characters',
            'any.required': 'Username is required',
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        phone: Joi.string().pattern(/^\+[1-9]\d{6,14}$/).allow('').messages({
            'string.pattern.base': 'Phone number must be in E.164 format (+91...)',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required',
        }),
    });

    return schema.validate(data);
};

// Validation schema for user login
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required',
        }),
    });

    return schema.validate(data);
};

module.exports = { registerValidation, loginValidation };
