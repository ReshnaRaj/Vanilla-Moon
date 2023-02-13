const express=require('express');
const cookieParser=require('cookie-parser');
const path=require('path');
const mongoose=require('./configurations/connection');
const session=require('express-session');
const layouts=require('express-ejs-layouts')
const logger=require('morgan')
const multer=require('multer')
const chart=require('chart.js')






const homeRoute=require('./routes/User');
const adminRoute=require('./routes/Admin');
const app=express();
const createError = require('http-errors')
app.use(layouts);
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs');
app.set('layout', path.join(__dirname,'views/layout/layouts'))//getting the directory of layouts


//cache clearing... 
app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
next();
});
//multer storage
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/images")//it says about the image where it storing
  },
  //identifying each pic by uploaded date
  filename:(req,file,cb)=>{
    cb(null,file.fieldname + "_" +new Date().toISOString().replace(/:/g, '-')+"_"+file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
app.use(multer({
  storage:storage,fileFilter}).fields([{name:'imagee',maxCount:6},{name:'BImage'}]))
app.use(logger('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({secret:'key',cookie:{maxAge:6000000}}));
app.use((req,res,next)=>{
  res.locals.message=req.session.message;
  delete req.session.message;
  next()
});



app.use('/',homeRoute);//giving the   path what we want to type in the url means if we type the '/' it will goes to home page
app.use('/admin',adminRoute)


//image uploading





// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err,"444444444444444444000000000000");
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(res.locals.message,"error coming.......");
    // render the error page
    res.status(err.status || 500);
    res.render('Errorr/error')
    // res.send('dont worry u will gt..');
});


app.listen(5000, () => {
    console.log('Vannilla Moon server started at port 5000');
})

