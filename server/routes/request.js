const express=require('express');
const router=express.Router();
const Request = require('../models/request');
const User = require('../models/user');

router.post('/',(req,res)=>{
    User.findOne({username:req.body.for},(err,user)=>{
        if(err || !user){
            res.json({userExist:false})
        }else if(user._id.equals(req.body.from)){
            res.json({weird:true})
        }
        else{
            Request.findOne({for:user._id,from:req.body.from},async (err,request)=>{
                const reverseRequest = await Request.findOne({from:user._id,for:req.body.from});
                if(request || reverseRequest){ 
                  res.json({requestExist:true})
                }
                else{
                    Request.create({from:req.body.from},(err,newRequest)=>{
                        if(err){
                            res.send('error');
                        }else{
                            newRequest.for=user._id;
                            newRequest.save();
                            Request.populate(newRequest,'from',(err,populatedRequest)=>{
                                res.json(populatedRequest);
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get('/:userID',(req,res)=>{
      Request.find({for:req.params.userID})
     .populate('from')
     .exec((err,requests)=>{
         if(err){
             res.send('error');
         }else{
             res.json(requests);
         }
     })
})

router.delete('/:requestID',(req,res)=>{
    Request.findByIdAndDelete(req.params.requestID,(err,deletedRequest)=>{
        if(err){
            res.send('error');
        }else{
            res.json(deletedRequest);
        }
    })
})

module.exports=router;