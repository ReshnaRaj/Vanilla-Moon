const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    Phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"Unblocked",
        
    },
    address:[
        {
            name:{type:String},
            house:{type:String},
            post:{type:String},
            city:{type:String},
            district:{type:String},
            state:{type:String},
            pin:{type:Number}
        }
    ],

})
module.exports=UserModel=mongoose.model('user',userSchema)