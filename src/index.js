require('dotenv').config();
require('../src/config/conn.js')

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

app.listen(3000,()=>
{
    console.log('server is connected to port 3000')
})

