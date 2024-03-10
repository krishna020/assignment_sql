const express=require('express')
const router=express.Router();
const path=require('path')
const multer=require('multer')

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

const {signUpValidation} =require('../helpers/validation')
const {register}=require('../controllers/userController')

//router.post('/register',upload.single('profilePic'),signUpValidation,userController)
router.post('/register', upload.single('profilePic'), signUpValidation, register);


module.exports=router;