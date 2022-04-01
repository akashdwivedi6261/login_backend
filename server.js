require('dotenv/config')
const mongoose = require("mongoose")
const express = require("express")
const app = express();
var cors = require('cors')

const userRouter = require("./Routers/userRouter")
app.use(express.json());
const corsOptions ={
  origin:'http://localhost:8001/api/user/signup', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors());
app.use("/api/user", userRouter)



mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("connected to mongodb"))
.catch((err) => console.log("connection failed"))

const port = process.env.PORT || 8002


app.listen(port, () => {
    console.log("server started", port);
})