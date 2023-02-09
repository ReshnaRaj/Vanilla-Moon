const mongoose=require('mongoose');
const CartSchema=new mongoose.Schema({
    userr:{
        type: mongoose.Schema.Types.ObjectId,
        require:true,
        ref: "users"
      },
    productt: [
        {
          id:{
            type:mongoose.Schema.Types.ObjectId ,
            require:true,
            ref:"products"
          },
          quantity:{
            type: Number,
          },
          price:{
            type:Number
          }
          
        }
        
      ],
    // totalprice:{
    //   type:Number
    //  }
   
})
module.exports = mongoose.model("Cart",CartSchema);