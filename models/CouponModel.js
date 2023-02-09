const mongoose = require('mongoose');

const coupnSchema =new mongoose.Schema({
  
    
    couponCode:{
        type:String,
        required:true,
        unique:[true,'Already exist'],
    },
    couponamount:{
        type:Number,
        required:true
    },
    percentage:{
        type:String,
        required:true
    },
    minimumAmount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    }, 
    couponUser:[
        mongoose.Schema.Types.ObjectId
    ]

})

module.exports = couponModel = mongoose.model('coupon',coupnSchema);