const express=require('express')
const router=express.Router();
const path=require('path')
const multer=require('multer')
const {isAuthorise}=require('../middlewares/auth')

const storage=multer.diskStorage({

    destination:function(req,file,cb)
    {
      cb(null,path.join(__dirname,'../public/images'))
    },
    filename:function(req,file,cb)
    {
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const fileFilter=(req,file,cb)=>
    {
       (file.mimetype=='image/jpeg' || file.mimetype=='image/jpeg')?cb(null,true):cb(null,false);
    }
const upload=multer({
    storage:storage, 
    fileFilter:fileFilter
})

const {signUpValidation, loginValidation, forgetValidation,updateProfile} =require('../helpers/validation')
const {register,login,getUser,forgetPassword}=require('../controllers/userController')

//router.post('/register',upload.single('profilePic'),signUpValidation,userController)
router.post('/register', upload.single('profilePic'), signUpValidation, register);
router.post('/login', loginValidation,login)

router.get('/get-users',isAuthorise,getUser)
router.post('/reset-password',forgetValidation,forgetPassword)
router.post('/update-profile'),upload.single('profilePic',updateProfile,isAuthorise,updateProfile);

module.exports=router;