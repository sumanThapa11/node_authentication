import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL

app.use(cors());


//database connection
connectDB(DATABASE_URL);

//JSON
app.use(express.json());

//Load routes 
app.use("/api/user",userRoutes);

app.get('/',(req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});