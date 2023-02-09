const mongoose = require('mongoose')
const BannerSchema = new mongoose.Schema({
    Bname: {
        type: String,
    },
    BImage: {
        type: Array,
        required: true,
    },
    discription: {
        type: String,
        required: true,
    },
    status: {
        type:String,
        default:"enable"
    },
    url: {
        type:String,
        required:true,
    }
})

module.exports = BannerModel = mongoose.model('Banner', BannerSchema)
