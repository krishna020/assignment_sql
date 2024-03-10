const { check } = require('express-validator')

exports.signUpValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password is required').isLength({ min: 6 }),
    check('profilePic').custom((value, { req }) => {
        if (req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png') {
            return true;
        }
        else {
            return false;
        }

    }).withMessage('please upload an image type PNG, JPG')
]


exports.loginValidation = [
    check('email', 'Email is required').not().isEmpty().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password is required').isLength({ min: 6 }),
   
]

exports.forgetValidation = [
    check('email', 'Email is required').not().isEmpty().normalizeEmail({ gmail_remove_dots: true })
   
]

exports.updateProfile = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty().normalizeEmail({ gmail_remove_dots: true }),
]