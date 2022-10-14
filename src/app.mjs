//=========================Index.js============================>
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import route from './routes/route.js'
import dotenv from 'dotenv'
dotenv.config()
const app = express()

app.use(express.json())
app.use(multer().any())

mongoose.connect(process.env.DB, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB is connected'))
    .catch(err => console.log(err.message))

app.use('/', route)

app.use((req, res) => {
    res.status(400).send({ status: false, message: 'Invalid URL' })
})

app.listen(process.env.PORT, () => {
    console.log(`Express app is running on port ${process.env.PORT}`)
})
