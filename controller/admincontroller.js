const Adminmodel=require('../models/adminModel');
const USerModel=require('../models/userModel')
const bcrypt = require("bcrypt");
const productModel=require('../models/productModel')
const CategoryModel = require('../models/categoryModel');
const BannerModel=require('../models/bannerModel')
const {handleDuplicate}=require('../errorHandling/dberrors');
const CouponModel = require('../models/CouponModel');
const {couponduplicate}=require('../errorHandling/dberrors');
const orderModel = require('../models/orderModel');
const sharp=require('sharp')



module.exports={

adminlogin: (req,res)=>{
  try {
  if(!req.session.adminLogin){
    res.render('admin/adminlogin')
  }
  else{
    res.redirect('/admin/adhome')
  }
}
   catch (err) {
    next(err)
   }
},
adminhome: async(req,res)=>{
      try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      let salesChart = await orderModel.aggregate([
        {
          $match: {
            order_status: { $ne: "pending" },
            ordered_date: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$ordered_date" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      console.log(salesChart,"sales chart workingggggg")
      
      const users = await USerModel.find({}).count();
      console.log(users, "jj")
      const products = await productModel.find({}).count()
      console.log(products, "ppp")
      const categories = await CategoryModel.find({}).count()
      const order = await orderModel.find({ order_status: { $ne: "pending" } }).count()
      let orders = await orderModel.find({ order_status: { $ne: "pending" } }).populate('productt.product_id').populate('userid').sort({ ordered_date: -1 }).limit(10)
      let CODcount=await orderModel.find({'payment.payment_method':'cash  on delivery'}).count()
      let ONLINEcount=await orderModel.find({'payment.payment_method':'Online_payment'}).count()


      console.log(CODcount,"oo");
      console.log(ONLINEcount,"oo");

      res.render("admin/home", { users, products, categories, order, orders,page:'Dashboard',CODcount,ONLINEcount,salesChart});

    } catch (err) {
      next(err)
    }

  },
adLogin: async (req,res) => {
  // console.log("huhhh");
  try {
      const { email, password } = req.body;
      // console.log(req.body);
      const admin = await Adminmodel.findOne({email:email });///first email is from database
      // console.log(admin,'sdfghjkl');
      if (!admin) {
          return res.redirect('/admin');
      }

      const isMatch = await bcrypt.compare(password,admin.password);
      console.log(isMatch);
      if (!isMatch) {
          return res.redirect('/admin');
      }
      req.session.adminLogin = true;
      // console.log("noooo");
      // req.session.admin = admin.email
      res.redirect('/admin/adhome');

  } catch (err) {
      next(err)
  }
},

viewuser:async(req,res,next)=>{
  try {
    const users=await USerModel.find()
    res.render('admin/viewuser',{users,page:"userss"})
    
  } catch (error) {
    next(error)
    
  }
 
  // console.log("INSIDE VIEWUSER");/// users name we calling in ejs file it should be same
  //   res.render('admin/viewuser')
  },///getviewuser

viewproduct:async(req,res,next)=>{
  try {
    const pdts=await productModel.find().populate('category')
    
    // console.log('reshna');
    // console.log(pdts[0]);
    res.render('admin/viewproduct',{pdts,page:"products"})
    
  } catch (error) {
    next(error)
    
  }
 
},//get
// postproduct:(req,res)=>{
//   res.render('admin/add-product')
// },
addproduct:async(req,res,next)=>{
  try {
    const category=await CategoryModel.find()
  console.log(category);
  res.render('admin/add-product',{category,page:"products"})
    
  } catch (error) {
    next(error)
    
  }
  
},
postaddproduct:(req,res,next)=>{
  try {
    // console.log(req.files,'huuuuuu');
  const image=req.files.imagee
  // console.log(image);
  const img = []
  image.forEach(element => {
    img.push(element.path.substring(6))
  });
  const pdts=new productModel({
    productName:req.body.productName,
    image:img,
    description:req.body.description,
    category:req.body.category,
    price:req.body.price,
    size:req.body.size,
    stock:req.body.stock

  })
  pdts.save((error)=>{
    if(error){
      
      res.json({message:error.message,type:'danger'});
    } else {
      req.session.message={
        type:'success',
        message:'product added successfully'
      }
      res.redirect('/admin/viewproduct')
    }
  })
  
  
    
  } catch (error) {
    next(error)
    
  }
  // console.log("jiiii");


},
editproduct:async(req,res,next)=>{
  try {
    
  const id=req.params.id; 
  let cate=await CategoryModel.find()
  let pdt=await productModel.findOne({_id:id})
  // console.log(pdt);
  // console.log("datasss");
  res.render('admin/editproduct',{pdt,cate,page:"products"})
    
  } catch (error) {
    next(error)
    
  }
 
},
posteditproduct:async(req,res,next)=>{
  try {
    console.log("POST EDIT PRODUCT");
    console.log(req.files,'huuuuuu');
    const id=req.params.id;
    // console.log(req.body.category,'ivde');
    // await CategoryModel.findOneAndUpdate({_id:id},{$set:{name:category}})
    // let cate=await CategoryModel.find()
    console.log(req.body);
    const image=req.files.imagee
   
    
   
    if(image){
      console.log('coming here');
      const img = []
    image.forEach(element => {
      img.push(element.path.substring(6))
      // sharp(files.path).resize({width:400,height:500}).toFile(`images`)
    });
    await productModel.findOneAndUpdate({_id:id},{$set:{image:img}})
    
    
    }
  
    //  req.body.category = toString(req.body.category)
  let pdt = await productModel.findOneAndUpdate({_id:id},{$set:req.body})
  // if(error){
  //   res.json({message:error.message,type:'danger'});
  // } else {
  //   req.session.message={
  //     type:'success',
  //     message:'Updated Successfully'
  //   }
  // }
  req.session.message={
    type:'success',
    message:'Updated Successfully'
  }
  
    console.log("product adding successfully...");
    res.redirect('/admin/viewproduct')
    
  } catch (error) {
    next(error)
    
  }
 
},

// editproduct:(req,res)=>{
//   res.render('admin/editproduct')
// },
viewcategory:async(req,res,next)=>{
  try {
    const cate=await CategoryModel.find()
   
    res.render('admin/viewcategory',{cate,page:"catees"})
    
  } catch (error) {
    next(error)
    
  }
 
  },


addcategory:(req,res)=>{
  
    res.render('admin/add-category',{page:"catees",errors:''})
  },
  postaddcategory:(req,res)=>{
    const cate=new CategoryModel({
      name:req.body.name
    })
    cate.save()
    .then((newone) => {
      req.session.message={
      type:'success',
      message:'New Category added Successfully',
      }
      // console.log(newOne)
      res.redirect('/admin/viewcate')
    })
    .catch((err) => {
      const error = { ...err}
  
      let errors
      if (error.code === 11000) {
        errors = handleDuplicate(error)
        res.render('admin/add-category',{page:"catees",errors})
      }
    })


    // console.log("get it");

    // res.render('admin/viewcategory',{cate})
   
  },
  editcategory:async(req,res,next)=>{
    try {
      const  id=req.params.id;
   let category=await CategoryModel.find({_id:id})
    res.render('admin/editcategory',{category,page:'catees'})
      
    } catch (error) {
      next(error)
      
    }
    // console.log("editeeeed");
   
  },
 
  posteditcategory:async(req,res,next)=>{
    try {
      const  id=req.params.id;
   await CategoryModel.updateOne({_id:id},{$set:{name:req.body.name}})
  //  if(error){
  //   res.json({message:error.message,type:'danger'});
  //  } else {
  //   req.session.message={
  //     tyep:'success',
  //     message:'updated successfully'
  //   }
  //  }
 req.session.message={
      type:'success',
      message:'updated successfully'
    }
  // console.log("editttt");
  res.redirect('/admin/viewcate')
      
    } catch (err) {
      const error={...err}
      let errors 
      if(error.code===11000){
        errors=handleDuplicate(error)
        // res.redirect('/admin/editcategory/:id')
        res.render('admin/add-category',{page:"catees",errors})
      }
      next(error)
      
    }
    
  },
  viewbanner:async(req,res)=>{
    try {
      const banners=await BannerModel.find()
    
      res.render('admin/viewbanner',{page:'bann',banners})
      
    } catch (error) {
      
    }
   
  },
  addbanner:(req,res)=>{
    res.render('admin/add-banner',{page:'bann'})

  },
  postaddbanner:(req,res,next)=>{
   try {
    const imageb=req.files.BImage
    console.log(imageb);
    const imgUrl= imageb[0].path.substring(6)
      const banne=new BannerModel({
        Bname:req.body.Bname,
        BImage:imgUrl,
        url:req.body.url,
        discription:req.body.discription,   
      })
      banne.save((error)=>{
        if(error) {
          res.json({message:error.message,type:'danger'});
        } else {
          req.session.message={
            type:'success',
            message:'banner added successfully'
          }
          res.redirect('/admin/viewban')
        }
      })
      
   } catch (error) {
       next(error)
   }

  },
  enablebanner:async(req,res)=>{
    try{
      const id=req.params.id
      // console.log("CHECK");
      await BannerModel.updateOne({_id:id},{$set:{status:"enable"}})
      .then(()=>{
        res.redirect('/admin/viewban')
      })
    } catch(err){
      next(err)
    }
  },
  disablebanner:async(req,res)=>{
    try{
      const id=req.params.id
      // console.log("CHECK disable");
      await BannerModel.updateOne({_id:id},{$set:{status:"disable"}})
      
      .then(()=>{
        res.redirect('/admin/viewban')
      })
    } catch(err){
      next(err)
    }
  },
  deleteBanner:async(req,res)=>{
    try {
      const id = req.params.id;
      // const imgb=req.files.BImage
      await BannerModel.remove({ _id: id });
      res.redirect("/admin/viewban")

  } catch (err) {
      next(err)
  }
},
  viewcoupon:async(req,res)=>{
    try {
      const coupon=await CouponModel.find()
      res.render('admin/viewcoupon',{coupon,page:"coop"})
      
    } catch (error) {
      
    }
  },
  addcoupon:async(req,res)=>{
    try {
      res.render('admin/add-coupon',{page:'coop',errors:''})
      
    } catch (error) {
      
    }
  },
  postaddcoupon:async(req,res)=>{
      const coop1=new CouponModel({
        couponCode:req.body.couponCode,
        couponamount:req.body.couponamount,
        percentage:req.body.percentage,
        minimumAmount:req.body.minimumAmount,
        expiryDate:req.body.expiryDate,

      });
      coop1.save().then(()=>{
        req.session.message={
          type:'success',
          message:'New Coupon added Successfully',
        }
        res.redirect('/admin/viewcoupon')
      }).catch (error =>{
      // const error1={...error}
      console.log(error);
      let errors
      if(error.code === 11000){
        errors=couponduplicate(error)
        res.render('admin/add-coupon',{page:'coop',errors})
      }
     
      
    })
  },
  
  editcoupon:async(req,res)=>{
    try {
      const id=req.params.id;
      let cooup=await CouponModel.find({_id:id})
      res.render('admin/editcoupon',{cooup,page:'coop'})
      
    } catch (error) {
      
    }
  },
 posteditcoupon:async(req,res,next)=>{
  try {
    const id=req.params.id;
    console.log(id,"coupon id comingg");

    let cooup=await CouponModel.findByIdAndUpdate(id,{$set:{
      couponCode:req.body.couponCode,
      couponamount:req.body.couponamount,
        percentage:req.body.percentage,
        minimumAmount:req.body.minimumAmount,
        expiryDate:req.body.expiryDate,
    }

    })
    cooup.save().then(()=>{
      res.redirect('/admin/viewcoupon')
    })
  } catch (error) {
    next(error)
    
  }
 },
 deletecoupon:async(req,res,next)=>{
  try {
    const id=req.params.id;
    await CouponModel.findByIdAndDelete({_id:id})
    res.redirect('/admin/viewcoupon')
  } catch (error) {
    next(error)
    
  }
 },


 vieworder:async(req,res,next)=>{
  try {
    console.log("order coming....")
    const order=await orderModel.find({order_status:{$ne:'pending'}}).populate('userid').sort({ordered_date:-1})
    
    res.render('admin/view-order',{page:'order',order})
    
  } catch (error) {
    next(error)
    
  }
 },
 invoice: (req, res, next) => {
  try {
    orderModel
      .findOne({ _id:req.params.id })
      .populate(["productt.product_id", "userid"])
      .then((invoice) => {
        res.render("admin/orderinvoice", {
          page: "order",
          invoice,
        });
      });
  } catch (error) {
    next(error);
  }
},
// invoice: async (req,res,next) => {
//   try {
//     orderModel.findOne().populate(['productt.product_id', 'userid'])
//   res.render('admin/orderinvoice', {page: 'order',invoice})
//   } catch (error) {
//     next(error);
//   }
// },
 orderlistt: (req,res,next) => {
  console.log("order list working....");
  try {
    console.log(req.params.id,"7++++++++++");
    orderModel
      .findOne({ _id:req.params.id })
      .populate(["productt.product_id", "userid"])
      .then((singleorder) => {
         
        res.render("admin/orderlist",{singleorder,page:'order'});
      });
  } catch (error) {
    next(error);
  }
},
  delivarystatus: (req, res, next) => {
    console.log("workinggg...");
    try {
      console.log("delivery status working...");
      console.log(req.body.Status,"ppppppppp+++++");
      if (req.body.Status == "shipped") {
        console.log(req.params.id,"ddddddddd");
        orderModel
          .updateOne(
            { _id:req.params.id},
            {
              $set: {
                "delivery_status.shipped.state": true,
                "delivery_status.shipped.date": Date.now(),
              },
            }
          )
          .then((data) => {
            res.redirect("/admin/vieworder");
          });
      } else if (req.body.Status == "out_for_delivery") {
        orderModel
          .updateOne(
            { _id:req.params.id },
            {
              $set: {
                "delivery_status.out_for_delivery.state": true,
                "delivery_status.out_for_delivery.date": Date.now(),
              },
            }
          )
          .then((data) => {
            res.redirect("/admin/vieworder");
          });
      } else if (req.body.Status == "delivered") {
        console.log(req.params.id,"8-8-8-8-8-8");
        orderModel
          .updateOne(
            { _id:req.params.id },
            {
              $set: {
                "delivery_status.delivered.state": true,
                "delivery_status.delivered.date": Date.now(),
              },
            }
          )
          .then(() => {
            res.redirect("/admin/vieworder");
          });
      } else {
        res.redirect("/admin/vieworder");
      }
    } catch (error) {
      next(error);
    }
  },
  viewsales:async(req,res)=>{
    try {
      res.render('admin/viewsales',{page:'sales'})
      
    } catch (error) {
      next(error)
      
    }
  },
  viewReport:async(req,res)=>{
    try {
      console.log("working...");
      salesData=await orderModel.aggregate([
        {
          $match: {
            order_status: "completed",
            $and: [
              { ordered_date: { $gt: new Date(req.body.fromDate) } },
              { ordered_date: { $lt: new Date(req.body.toDate) } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "_id",
            as: "userx",
          },
        },
      ])
      console.log(salesData,"saledata working...");
      res.render('admin/viewreport',{page:'sales',salesData})
      
    } catch (error) {
      next(error)
      
    }
  },






// -------------------admin login---------------//



// ------------------blocking and unblocking-----------//
blockUser: async (req, res,) => {
  try {
      const id = req.params.id
      await USerModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Blocked" } })
          .then(() => {
              res.redirect('/admin/viewuser')
          })

  } catch (err) {
      next(err)
  }
},

unblockUser: async (req, res) => {
  try {
      const id = req.params.id
      await USerModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Unblocked" } })
          .then(() => {
              res.redirect('/admin/viewuser')
          })

  } catch (err) {
      next(err)
  }
},
// ------------------------------------END OF BLOCKING AND UNBLOCKING------------------------------------------------------//


listpdt: async (req, res) => {
  try {
      const id = req.params.id
      await productModel.findByIdAndUpdate({ _id:id }, { $set: {status: "Listed" } })
          .then(() => {
              res.redirect('/admin/viewproduct')
          })

  } catch (err) {
      next(err)
  }
},

unlistpdt: async (req, res) => {
  try {
      const id = req.params.id
      await productModel.findByIdAndUpdate({ _id:id }, { $set: { status: "UnListed" } })
          .then(() => {
              res.redirect('/admin/viewproduct')
          })

  } catch (err) {
      next(err)
  }
},
// -------------------------------END OF LIST AND UNLIST PRODUCTS---------------------------



listcate: async (req, res) => {
  try {
      const id = req.params.id
      await CategoryModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Listed" } })
          .then(() => {
              res.redirect('/admin/viewcate')
          })

  } catch (err) {
      next(err)
  }
},

unlistcate: async (req, res) => {
  try {
      const id = req.params.id
      await CategoryModel.findByIdAndUpdate({ _id: id }, { $set: { status: "UnListed" } })
          .then(() => {
              res.redirect('/admin/viewcate')
          })

  } catch (err) {
      next(err)
  }
},

imagedelete:async(req,res,next)=>{
try {
  console.log("IMAGE DELETE");
  const val = req.body.img;
  const id = req.body.pid;
  fs.unlink(path.join(__dirname,  val), () => {});
  await productModel.updateOne({ _id: id }, { $pull: { image: val } });
  res.json('succes')
} catch (error) {
  next(error)
}
},
// -------------------------------END OF LIST AND UNLIST CATEGORY---------------------------

logoutadmin:(req,res)=>{
  try {
  req.session.loggedOut=true;
  req.session.destroy()
  res.redirect('/admin')
} catch (err) {
  next(err)
}
},
};