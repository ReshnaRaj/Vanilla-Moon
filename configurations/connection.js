// mongodb connect
const mongoose = require('mongoose');
// const db=require('../errorHandling/dberrors')

mongoose.connect('mongodb://127.0.0.1:27017/footwear',()=>{
    // db.on('error', (error) => console.error(error))
    console.log('mongoose connected')
});
mongoose.set('strictQuery',true);

