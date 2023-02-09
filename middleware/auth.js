const USerModel=require('../models/userModel')


module.exports= {
    userSession:async (req,res,next) =>{
       
        if(req.session.user ) {
            const user=await USerModel.findOne({_id:req.session.user._id ,status:"Unblocked"})
            console.log(user+"fdfydgfyt")
            if(user){
                next()
            
            }else{
                req.session.user=null;
                res.redirect('/login')
            }
            
        }
        else
        {
            res.redirect('/login')
        }
    },
    userHome:async (req,res,next) =>{
       
        if(req.session.user ) {
            const user=await USerModel.findOne({_id:req.session.user._id ,status:"Unblocked"})
            // console.log(user)
            if(user){
                console.log("usereee");
                next()
            
            }else{
                console.log("hiiiiiiiiiii");
                req.session.user=null;
                next()
            }
            
        }
        else
        {
            console.log("thihih");
            next() 
        }
    },
    adminSession: (req,res,next) =>{
        if(req.session.adminLogin) {
            next()
        }
        else {
            // console.log("adminnn");
            res.redirect('/admin')

        }
    }
};