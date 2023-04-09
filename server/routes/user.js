const express=require('express');
const router=express.Router();
const User = require('../models/user');
const Chat = require('../models/chat');

router.post('/',(req,res)=>{
    User.findOne({username:req.body.username},(err,existingUser)=>{
        if(err || existingUser){
            res.json({usernameExist:true})
        }else{
            User.create({username:req.body.username},(err,newUser)=>{
                if(err){
                    res.send('error')
                }else{
                    Chat.findById('6092ceda13f0b240f88e8b68')
                    .populate({
                        path:'messages',
                        populate:{
                            path:'owner',
                            model:'User'
                        }
                    })
                    .exec(
                    (err,foundChat)=>{
                        if(err){
                            res.send('err');
                        }else{
                            foundChat.between.push(newUser);
                            foundChat.save();
                            res.json({
                                user:newUser,
                                chat:foundChat
                            })
                        }
                    })
                }
            })
        }
     }) 
});

router.get('/:userID',(req,res)=>{
    User.findById(req.params.userID,(err,foundUser)=>{
        if(err){
            res.json(false)
        }else{
            res.json(foundUser);
        }
    })
})

module.exports=router;