const express=require('express');
const router=express.Router();
const User = require('../models/user');

router.post('/',(req,res)=>{
    User.findOne({username:req.body.username},(err,existingUser)=>{
        if(err || existingUser){
            res.json({usernameExist:true})
        }else{
            User.create({username:req.body.username},(err,newUser)=>{
                if(err){
                    res.send('error')
                }else{
                    res.json(newUser);
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