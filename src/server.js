require('dotenv').config();

const express=require('express')
const cors=require('cors')

const app=express();


app.use(cors())

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