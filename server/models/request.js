const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const requestSchema = new Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    for:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    accepted:Boolean
})

module.exports=mongoose.model('Request',requestSchema);