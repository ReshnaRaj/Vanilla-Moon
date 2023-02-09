const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:[true,'Already exist'],
    // lowercase:true,
  set:value=>value.toLowerCase()
    
  },
  status:{
    type:String,
    default:"List",
  }
  // description: {
  //   type: String,
  //   maxlength: 100,
  //   required: true
  // },
  // image: {
  //   type: String,
  //   required: true
  // }
// },
// { timestamps: true }
})

module.exports=CategoryModel=mongoose.model('category',categorySchema)