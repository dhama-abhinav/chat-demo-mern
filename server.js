//importing
import express from "express";
import mongoose from "mongoose";
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import cors from 'cors'

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1159607",
    key: "679eab150b4303356652",
    secret: "083f7876a4c46625a88e",
    cluster: "ap2",
    useTLS: true
  });

//middleware
app.use(express.json())

// app.use( (req,res)=>{
//     res.setHeader("Access-Control-Allow-Origin" , "*");
//     res.setHeader("Access-Control-Allow-Headers" , "*")
//     next()
// })
app.use(cors())

// DB config
const connection_url = 'mongodb+srv://admin:6mYs7nrFP5TMiuoW@cluster0.wmrs0.mongodb.net/chatdb?retryWrites=true&w=majority'
mongoose.connect(connection_url , {
    //configuration stuff
    useCreateIndex : true,
    useNewUrlParser : true,
    useUnifiedTopology : true
})


const db = mongoose.connection 
db.once('open' , ()=>{
    console.log('db connected')

    const msgcollection = db.collection('messagecontents')
    const changeStream = msgcollection.watch()
    //console.log(changeStream)

    changeStream.on('change' , (change)=>{
        console.log( "a change occurred ....",change)

        if (change.operationType === "insert"){
            const messageDetails = change.fullDocument ;
            pusher.trigger('messages' , 'inserted' ,
            {
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received : messageDetails.received
            })
        }
        else{
            console.log('Error with triggering pusher')
        }
    })


})

// ????

// api routes
app.get("/", (req, res) => res.status(200).send("Hello world"));

//for retrieving messages 
app.get('/messages/sync' , (req,res)=>{
    Messages.find( (err,data)=> {
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

//for posting message
app.post('/messages/new' , (req,res)=> {
    const dbMessage = req.body

    Messages.create(dbMessage , (err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    })
})

// Listen
app.listen(port, () => console.log(`Listening on localhost: ${port}`));
