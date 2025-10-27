import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv, { config } from 'dotenv';
import connectdb from './config/connectdb.js'

import authRoutes from './routes/auth.js'


dotenv.config();
connectdb();


const app =express()
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.use('/api/auth',authRoutes)

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})