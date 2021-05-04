const express=require('express');
const router=express.Router();
const Message = require('../models/message');
const Chat = require('../models/chat')

router.post('/:chatID',(req,res)=>{
    Message.create(req.body,(err,newMessage)=>{
        if(err){
            res.send('error');
        }else{
            Chat.findById(req.params.chatID)
            .populate('between')
            .populate('messages')
            .exec((err,foundChat)=>{
                if(err){
                    res.send('error');
                }else{
                    foundChat.messages.push(newMessage);
                    foundChat.save();
                    res.json(foundChat);
                }
            })
        }
    })
})


module.exports=router;