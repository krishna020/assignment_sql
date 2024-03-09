require('dotenv').config();
require('../src/config/conn')

const express=require('express')
const cors=require('cors')
const bodyParser=require('body-parser')
const userRouter=require('../src/routes/userRoute')

const app=express();

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
app.use('/api/v1/users', userRouter)

// error handling 
app.use((err, req,res, next)=>
{
    err.statusCode=err.statusCode || 500
    err.message=err.message || 'Internal server error'
    res.status(err.statusCode).json({
        message:err.message
    })
})

app.listen(process.env.PORT,()=>
{
    console.log(`server is connected to port ${process.env.PORT}`)
})