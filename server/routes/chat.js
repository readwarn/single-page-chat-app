const express=require('express');
const router=express.Router();
const Chat = require('../models/chat');
const Request = require('../models/request');

router.post('/',async(req,res)=>{
     const response = await Request.findById(req.body.id);
     response.accepted = true;
     response.save();
     Chat.findOne({between:req.body.between},(err,chat)=>{
         if(chat){
             res.json({chatExist:true})
         }else{
            Chat.create({},(err,newChat)=>{
                if(err){
                    res.send('errr')
                }else{
                    newChat.between.push(req.body.between[0]);
                    newChat.between.push(req.body.between[1]);
                    newChat.save();
                    Chat.populate(newChat,"between",(err,populatedChat)=>{
                        if(!err){
                            res.json(populatedChat)
                        }
                    })
                }
            })
         }
     })
})

router.get('/:userID',(req,res)=>{
    Chat.find({between:req.params.userID})
    .populate('between')
    .populate('messages')
    .exec(
    (err,chats)=>{
        if(err){
            res.send('error');
        }
        else{
            res.json(chats);
        }
    })
})

module.exports=router;