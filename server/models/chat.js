const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const chatSchema = new Schema({
    between:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }],
    dm:Boolean,
    name:String
})

module.exports=mongoose.model('Chat',chatSchema);