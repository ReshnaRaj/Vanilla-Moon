const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user1:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    product1:[ {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'products'
    } 
    ],
})

module.exports = WishlistModel = mongoose.model("Wishlist",wishlistSchema)