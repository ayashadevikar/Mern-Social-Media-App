import express from 'express';
import dotenv from 'dotenv';
import dbConnection from './config/dbConnection.js';
import userRouter from './router/user.routes.js';
import postRouter from './router/post.routes.js';
import cookieParser from 'cookie-parser';

const app = express();

dotenv.config();
dbConnection();


 

app.use(express.json());

app.use(express.urlencoded({ extended: true}));

app.use(cookieParser());

app.use('/', userRouter);
app.use('/', postRouter);

export default app;