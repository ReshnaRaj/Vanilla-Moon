const USerModel=require('../models/userModel')


module.exports= {
    ajaxSession:async (req,res,next) =>{
       
        if(req.session.user ) {
    //  console.log("inside if condition");
        next()
        }
        else
        {
            console.log("inside else condition");
            res.json('login first')
        }
    },
   
   
};