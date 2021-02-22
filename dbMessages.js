import mongoose from 'mongoose'
// schema is something like showing how the data is gonna be build

const chatSchema = mongoose.Schema( {
    message : String,
    name : String ,
    timestamp : String ,
    received : Boolean
})

export default  mongoose.model('messagecontents' , chatSchema)