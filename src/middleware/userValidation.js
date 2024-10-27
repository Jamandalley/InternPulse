const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const userValidationSchema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
        })
});

const validateUser = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Validation error',
            errors: { details: error.details[0].message }
        });
    }
    next();
};

module.exports = { validateUser };