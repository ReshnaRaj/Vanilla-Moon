const UserModel = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const productModel = require('../models/productModel');
const bannerModel = require('../models/bannerModel');
const categoryModel = require('../models/categoryModel');
const WishlistModel = require('../models/wishlistModel');
const CartModel = require('../models/CartModel')
const orderModel = require('../models/orderModel')
const couponModel = require('../models/CouponModel')
const Razorpay = require('razorpay')
ObjectId = require('mongodb').ObjectID;

const crypto = require('crypto')
require("dotenv").config();
var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })
const ITEMS_PAGE = 6



let transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,

  auth: {
    user: process.env.user,
    pass: process.env.pass,
  }

});

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp + "TEST");

module.exports = {

  userhome: async (req, res) => {
    let user = null
    if (req.session.user) {
      user = req.session.user
      console.log(user + 'userhome page startedd');
    }
    const pdtss = await productModel.find().limit(7)//showing the number of product sin the home page
    const banne = await bannerModel.find({ status: "enable" })
    // console.log(banne,'baner');
    res.render('user/userhome', { user, pdtss, banne })
  },
  pdtdetails: async (req, res) => {
    console.log("hello");
    let user = req.session.user
    const pdtid = req.query.pdtc
    const pdtx = await productModel.findOne({ _id: pdtid }).populate('category')
    console.log(pdtx);
    res.render('user/pdt_details', { pdtx, user })

  },

  login: (req, res) => {
    try {
      if (!req.session.userLoggedIn) {
        res.render('user/login')
      }
      else {
        res.redirect('/')
      }

    } catch (err) {
      next(err)
    }
  },
  doLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email + 'Checking email is coming or not');
      const user = await UserModel.findOne({ email: email });
      console.log(user, 'already registered user loginnedd');
      if (!user) {
        
        req.session.message = {
          type: 'danger',
          message: 'You are a new user  plz create new registration',
          
        }
        return res.redirect('/login');
      }
      else if (user.status != 'Blocked') {


        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch, 'match');
        if (!isMatch) {
          req.session.userLoggedIn = false
        req.session.message = {
          type: 'danger',
          message: 'Invalid password'
        }
          return res.redirect('/login');
        }
        req.session.user = user
        console.log(req.session.user);
        res.redirect('/');
      } 
      else if(user.status == 'Blocked'){
        
        req.session.message = {
          type: 'danger',
          message: 'Sorry Admin Banned your account'}
          res.redirect('/login')


      }else {
        res.redirect('/login')
      }
    } catch (err) {
      next(err)
    }
  },
  // otp: (req, res) => {
  //   res.render('user/otpvalid')

  // },
  otp: async (req, res) => {
    try {
      // userName = req.body.userName
      // email = req.body.email;
      // Phone = req.body.phone
      req.session.userName = req.body.userName
      req.session.email = req.body.email
      req.session.Phone = req.body.Phone
      req.session.password = req.body.password
      email = req.body.email

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        // send mail with defined transport object
        var mailOptions = {
          from: process.env.user,
          to: req.body.email,
          subject: "Otp for registration is: ",
          html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          res.render('user/otpvalid');
        });

      }
      else {
        res.redirect('/login')//if the mail id is already registered i rendering the login page
      }

    } catch (err) {
      next(err)
    }
  },
  resendotp: (req, res) => {
    try {
      const mailOptions = {
        from: process.env.user,
        to: req.session.email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('user/otpvalid', { msg: "otp has been sent" });
      });

    } catch (err) {
      next(err)
    }
  },

  verifyotp: async (req, res) => {
    try {
      if (req.body.otp == otp) {
        // res.send("You has been successfully registered");
        req.session.password = await bcrypt.hash(req.session.password, 10)
        // console.log(req.session.password)

        const newUser = UserModel(
          {
            userName: req.session.userName,
            email: req.session.email,
            Phone: req.session.Phone,
            password: req.session.password,
          })

        newUser
          .save()
          .then(() => {
            // req.session.userLoggedIn=true;
            res.redirect("/");
          })
      }
      else {
        res.render('user/otpvalid');
      }
    } catch (err) {
      next(err)

    }
  },

  signup: (req, res) => {
    res.render('user/signup')
  },



  // doSignup: async (req, res) => {

  //   req.body.password = await bcrypt.hash(req.body.password, 10)
  //   console.log(req.body);
  //   let user = UserModel({
  //     userName: req.body.userName,
  //     email: req.body.email,
  //     Phone: req.body.Phone,
  //     password: req.body.password

  //   })
  //   user.save().then((doc) => {
  //     req.session.user=doc
  //     res.redirect('/')
  //   })
  // },

  logoutUser: (req, res) => {
    try {
      req.session.loggedOut = true;
      req.session.user = null;
      res.redirect('/')
    } catch (err) {
      next(err)
    }
  },
  userdetails: async (req, res) => {
    try {
      uzer = req.session.user

      const user = await UserModel.findOne({ _id: uzer._id })
      // console.log(uzer);

      res.render('user/userdetail', { pages: 'user', user })
    } catch (error) {


    }
  },
  addaddress: async (req, res) => {
    try {
      console.log("Add address working");
      // const id = req.params.id;
      // console.log(id);
      // let isExist = await UserModel.findOne({ _id:id })
      // console.log(isExist + "INSIDE");


      let newaddresss = {

        'name': req.body.Name,
        'house': req.body.House,
        'post': req.body.post,
        'city': req.body.city,
        'district': req.body.district,
        'state': req.body.state,
        'pin': req.body.pin
      }

      // console.log(newaddresss+"CHECK");
      await UserModel.updateOne({ _id: req.session.user._id }, { $push: { address: newaddresss } })
      res.redirect('/userdetails')
    } catch (error) {
      console.log("aaaaaaaaaaa");
      next(error)

    }
  },
  addcheckaddress: async (req, res) => {
    try {
      const id = req.params.id;
      order = await orderModel.findOne({_id:id})
      let isExistornot = await UserModel.findOne({ _id: order.userid })
      console.log(isExistornot + "data coming.......")
      let newcheckaddresss = {
        'name': req.body.Name,
        'house': req.body.House,
        'post': req.body.post,
        'city': req.body.city,
        'district': req.body.district,
        'state': req.body.state,
        'pin': req.body.pin
      }
      await UserModel.updateOne({ _id: order.userid }, { $push: { address: newcheckaddresss } })
      res.redirect('/checkout/' + id)
    } catch (error) {
      console.log("000000000000");
      next(error)

    }

  },
  editaddress: async (req, res, next) => {
    try {
      // console.log("REACHED");
      // const id=res.locals.userdata._id;
      const addid = req.body.id;
      user = req.session.user
      console.log(addid);
      let useraddress = await UserModel.findOne({ _id: user._id })
      // console.log(useraddress +"LOG");
      useraddress.address.forEach((val) => {
        if (val.id.toString() == addid.toString()) {
          console.log(val + 'editaddress value coming');
          res.json(val)
        }
      })
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  updateaddress: async (req, res, next) => {
    try {
      // console.log(req.params.id+"ADDRESS ID");
      // console.log(req.body);
      let newaddressupdate = {

        'address.$.name': req.body.Name,
        'address.$.house': req.body.House,
        'address.$.post': req.body.post,
        'address.$.city': req.body.city,
        'address.$.district': req.body.district,
        'address.$.state': req.body.state,
        'address.$.pin': req.body.pin
      }
      console.log(newaddressupdate);
      await UserModel.updateOne({ _id: user._id, 'address._id': req.params.id }, { $set: newaddressupdate })
        .then(() => {
          res.redirect('/userdetails')
        })
    } catch (error) {
      console.log(error);
      next(error)
    }
  },
  deleteaddress: async (req, res, next) => {

    try {
      user = req.session.user
      // console.log("rrrrrrrrrrrrrrrrreeeeeeeeeeee");
      await UserModel.updateOne({ _id: user._id }, { $pull: { address: { _id: req.body.id } } })
      res.json("deleted")
    } catch (error) {
      next(error)
    }
  },

  shop: async (req, res) => {
    user = req.session.user
    const page = req.query.page
    console.log(user);
    console.log("kkkk");
    let cat = await categoryModel.find({status:'Listed'})
    const sizes = await productModel.distinct('size')

    if (req.query.ctdc) {
      console.log(req.query.ctdc, "eeeeeeeeeeeee");
      let pdtss = await productModel.find({ category: req.query.ctdc , status:'Listed'})
      res.render('user/shop', { user, cat, pdtss, page, sizes })
    }
    else if(req.query.sort){
      try {
        console.log("sorting working...");
        if(req.query.sort=='price'){
          let pdtss=await productModel.find({status:'Listed'}).sort({price:1}).collation({ locale: "en", numericOrdering: true }).limit(ITEMS_PAGE)
          res.render('user/shop',{user,cat,pdtss,page,sizes})
        }
        
        
      } catch (error) {
        console.log(error,"loll");
        next(error)
        
      }
    }
    else if(req.query.search){
      console.log("search part1 ");
      try {
        console.log("searching working...");
        let key=req.query.search
        let pdtss=await productModel.find({ productName:{ $regex:key, $options:'i'},status:'Listed'})
        console.log(pdtss,"tttttttttt");
        console.log(key,"hhhhhhhhhhhhh");
        let cat=await categoryModel.find()
        res.render('user/shop', { user, cat, pdtss, page, sizes })

        
      } catch (error) {
        console.log(error)
        
      }
    }
    const pdtss = await productModel.find({status:'Listed'})
      .skip((page - 1) * ITEMS_PAGE)
      .limit(ITEMS_PAGE)

    res.render('user/shop', { user, cat, pdtss, page, sizes })
  },
  cart: async (req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id
    console.log(userId + "yyyyyyyyy");
    let Cartdetails = await CartModel.findOne({ userr: userId }).populate('productt.id')
    // if (!Cartdetails) {
    //   Cartdetails = {
    //     productt: []
    //   }
    // }
    console.log(Cartdetails, "cartdetails ssssssssssssssssss...");
    // let cart3=Cartdetails
    // console.log(cart3,"carts3 coming...");
    // console.log("cart working.....");

    res.render('user/cart', { user, userId, Cartdetails })
  },
  addtocart: async (req, res) => {
    try {
      console.log('check');
      let userId = req.session.user._id
      let proId = req.body.id
      console.log((proId + "product id"));
      let cart = await CartModel.findOne({ userr: userId })
      let product2 = await productModel.findOne({ _id: proId })
      let produObj = {
        id: proId,
        quantity: 1,
        price: product2.price
      }
      if (cart) {
        console.log("update cart");
        let indexvalue = cart.productt.findIndex((p) => p.id == proId)//checking the product is avaialabke in the database or not and taking the index value of the product inside the indexvalue
        // inside cart we created productt array
        console.log(indexvalue);
        if (indexvalue != -1) {
          console.log('new added');
          const quantity = cart.productt[indexvalue].quantity
          await CartModel.updateOne(
            {
              userr: userId,
              "productt.id": proId,
            },
            {
              $inc: { "productt.$.quantity": 1, "productt.$.price": product2.price, totalprice: product2.price }
            }
          )
          res.json('quantity inc')
        }

        //new product adding to the user cart account and also quantity increasing 
        else {
          console.log('Already added');
          await CartModel.updateOne({ userr: userId },
            { $push: { productt: produObj }, $inc: { totalprice: product2.price } })
          res.json('added')
        }
      }
      else {
        console.log("new cart");
        let usercart = {
          userr: userId,
          productt: [produObj],
          totalprice: product2.price

        };
        let newcart = await CartModel.create(usercart);
        console.log(newcart + "new cart");
        res.json('product add to cart')


      }




    } catch (error) {
      next(error)

    }
  },
  changequantity: async (req, res, next) => {
    try {
      // let totalAmount;
      let productprice;
      let cartdetail = req.body;

       console.log(cartdetail,"inside change quantity")
      let product = await productModel.findOne({ _id: cartdetail.product });
      console.log(product, "cartproduct");
      cartdetail.count = parseInt(cartdetail.count);
      cartdetail.quantity = parseInt(cartdetail.quantity);
      console.log(cartdetail.count)
      console.log(cartdetail.quantity)
      if (cartdetail.count === -1 && cartdetail.quantity === 1) {
        // console.log("rgegefg degrement");
        let data = await CartModel.findByIdAndUpdate(
          { _id: cartdetail.cart },
          {
            $pull: { productt: { id: cartdetail.product } },
            $inc: { totalprice: -product.price },
          },
          { new: true }
        );
        // console.log(data,"dataaaa")
        // totalAmount = data.totalprice;
        productprice = product.price;
        // console.log(totalAmount,"amount")

        if (data) {
          res.json({ removeProduct: true, productprice });//i removed totalAmount from here
        }
      }
      else {

        const data = await CartModel.updateOne(
          {
            _id: cartdetail.cart,
            "productt.id": cartdetail.product,
          },

          {
            $inc: {
              "productt.$.quantity": cartdetail.count,
              "productt.$.price": product.price * cartdetail.count,
              totalprice: product.price * cartdetail.count,
            },
          }
        );
        let cartdata = await CartModel.findOne({ userr: cartdetail.user });
        console.log(cartdata ,"fffffffffff");
 
         
        let proExist = cartdata.productt.findIndex(
         
          (p) => p.id ==  cartdetail.product
          
        );
       
        console.log(proExist,"proExist")
        let q = cartdata.productt[proExist].quantity;
        totalAmount = cartdata.carttotal;
        // console.log(totalAmount, "carttotal");
        productprice = product.price;

        // console.log(productprice,"product price");
        // console.log(q,"cartdata router working...");
        res.json({
          status: true, totalAmount, productprice, q
        });
      }
    } catch (err) {
      next(err);
    }
  },

  removeCart: async (req, res, next) => {
    try {
      let cart = req.body.cartId;
      const id = req.body.proId;
      console.log(cart, "cart working...")
      console.log(id, "product id working...");
      await CartModel.findByIdAndUpdate(
        { _id: cart },
        { $pull: { productt: { id: id } } },
      );

      res.json('removed')

    } catch (error) {
      next(error)
    }
  },
  CheckOut: async (req, res, next) => {
    try {
      user = req.session.user
      let orderdata = req.params.id
      userr = req.session.user._id
      // console.log(userr);
      let orderdetails = await orderModel.findOne({ _id: orderdata }).populate('productt.product_id')

      console.log(orderdetails, "orderdetails coming...");
      let userdetails = await UserModel.findOne({ _id: userr })

      res.render('user/checkout', { user, userdetails, orderdetails })

    } catch (error) {
      next(error)
    }
  },
  orderdata: async (req, res, next) => {
    try {
      console.log(req.body.cartId, "cartdid coming....")
      let cartId = req.body.cartId
      // console.log(cartId +'cartid coming........')
      let cartbill = await CartModel.findOne({ _id: cartId }).populate('productt.id')
      let cartD = []
      cartbill.productt.forEach((_id) => {
        let product = {
          product_id: _id.id._id,
          name: _id.id.productName,
          qnty: _id.quantity,
          price: _id.price,
        };
        cartD.push(product);
      });
      // console.log(cartbill+'cartbill comes.....')
      if (cartbill) {
        let bill_amount = cartbill.productt.reduce((sum, val) => {
          sum += val.price
          return sum;
        }, 0)
        // console.log(bill_amount,"cart bill total amount");
        let product = {
          userid: cartbill.userr,
          bill_amount,
          productt: cartD,
          coupon: { discount: 0 }
        }
        console.log(product);
        let neworder = new orderModel(product)
        neworder.save().then(async (data) => {
          // console.log(data,"data coming........");


          res.json(data)
        })
        // console.log(productt,"products details coming......")
        // console.log(cartbill);

      }
      

    } catch (err) {
      next(err)
    }
  },
  applycoupon: async (req, res, next) => {
    try {
      let apicoupon = {}
      console.log("apply coupon working.....");
      console.log(req.body.id, "ordrid");
      console.log(req.body.coupon, "coupon coming....");
      if (req.body.coupon) {
        couponModel.findOne({
          couponCode: req.body.coupon,
          couponUser: { $nin: req.session.user._id }

        })
          .then((data) => {
            console.log(data + "coupon finded");
            if (data) {
              if (data.expiryDate >= new Date()) {
                orderModel.findOne({
                  _id: req.body.id,
                  userid: req.session.user._id,
                  order_status: "pending",
                })
                  .then((orderdetails) => {
                    if (orderdetails.bill_amount > data.minimumAmount) {
                      orderModel.updateOne({
                        _id: req.body.id,
                        userid: req.session.user._id,
                        order_status: "pending",
                      },
                        {
                          $set: {
                            coupon: {
                              code: data.couponCode,
                              discount: data.percentage,

                            },

                          },
                        }
                      ).then(() => {
                        apicoupon.coupon = data;
                        apicoupon.message = "Applied coupon";
                        apicoupon.success = true;
                        res.json(apicoupon);

                      });

                    } else {
                      apicoupon.message = "This coupon cannot be used for this Amount";
                      res.json(apicoupon);
                    }
                  })

              } else {
                apicoupon.message = "coupon expired";
                res.json(apicoupon);

              }
            } else {
              apicoupon.message = "Invalid coupon || This coupon already used";
              res.json(apicoupon);

            }
          });
      } else {
        apicoupon.message = "enter coupon code";
        res.json(apicoupon);

      }

    } catch (error) {
      next(error)

    }
  },
  placeorder: async (req, res, next) => {
    try {
      console.log("place order working...");
      
        if (req.params.id);
        console.log(req.params.id, "place order id coming...")
        const order = await orderModel.findOne({
          _id: req.params.id,
          userid: req.session.user._id,
          order_status: 'pending'
        }).populate('productt.product_id')

        const isStockAvailable = order.productt.every(product => {
          return product.qnty <= product.product_id.stock;

        });
        
        if (!isStockAvailable) {
          console.log(isStockAvailable,"+++-----");
          let outOfStockProducts = [];
          order.productt.forEach(product => {
            if (product.qnty > product.product_id.stock) {
              outOfStockProducts.push(product.product_id.productName);
            }
          });
          req.session.message = {
            type: 'danger',
            message: `${outOfStockProducts} is out of stock`
          }
          res.json({ outOfStock: true })






        }
        else {
            order.productt.forEach(async (product) => {
              console.log("out of stockkkkkkkk");
          new_stock = product.product_id.stock - product.qnty
          await productModel.findByIdAndUpdate({ _id:product.product_id._id }, { $set: {stock: new_stock } })
        })
        if (req.body.optradio == 'COD') {
        console.log(isStockAvailable, "is stock availble printing....");
        console.log(order, "order worked....")
        if (order) {
          let user = await UserModel.findOne({ _id: req.session.user._id })
          console.log(user + "+++++++++++++++++++++++++++");
          user.address.forEach((val) => {
            if (val._id == req.body.adname) {
              orderModel.updateOne({
                _id: req.params.id
              },
                {
                  $set: {
                    address: {
                      name: val.name,
                      house: val.house,
                      post: val.post,
                      city: val.city,
                      district: val.district,
                      state: val.state,
                      pin: val.pin
                    },
                    order_status: "completed",
                    "payment.payment_id": "COD_" + req.params.id,
                    "payment.payment_order_id": "COD_noOID",
                    "payment.payment_method": "cash  on delivery",
                    "delivery_status.ordered.state": true,
                    "delivery_status.ordered.date": Date.now(),
                  },
                }).then(async () => {
                  console.log(order.coupon.code, "coupon user workinggg");
                  await couponModel.updateOne(
                    { couponCode: order.coupon.code },
                    { $addToSet: { couponUser: req.session.user._id } }

                  );
                  await CartModel.deleteOne(
                    { userr: req.session.user._id },


                  );
                  res.json("COD");
                });
            }
          })


        }
      }
      else {
        if (req.params.id) {
          console.log(req.params.id, "id working..");
          console.log("online payment working....");
          const order = await orderModel.findOne({ _id: req.params.id, userid: req.session.user._id, order_status: "pending" })
          console.log(order, "order coming...-++++")
          if (order) {
            let user = await UserModel.findOne({ _id: req.session.user._id })
            console.log(user + "user activated in online payment....");
            user.address.forEach((val) => {
              if (val.id == req.body.adname)
                orderModel.updateOne({ _id: req.params.id }, {
                  $set: {
                    address: {
                      name: val.name,
                      house: val.house,
                      post: val.post,
                      city: val.city,
                      district: val.district,
                      state: val.state,
                      pin: val.pin
                    },
                  }
                }).then(async () => {
                  await CartModel.deleteOne({ userr: req.session.user._id });
                  let total = order.bill_amount;
                  console.log(total + "total coming...");
                  instance.orders.create({ amount: Math.round((order.bill_amount - (order.bill_amount * order.coupon.discount) / 100) * 100), currency: "INR", receipt: "" + order._id })
                    .then((order) => {
                      res.json({ field: order, key: process.env.KEY_ID })


                    })
                })

            })
          }
        }
      }

    }  }catch (error) {
      next(error)

    }
  },
  cancelOrder: (req, res, next) => {
  
    try {
      console.log("order cancel working..");
      orderModel
        .updateOne(
          { _id: req.body.id },
          {
            $set: {
              order_status: "canceled",
              "delivery_status.canceled.state": true,
              "delivery_status.canceled.date": Date.now(),
            },
          }
        )
        .then(() => {
          res.json("Ordercanceled");
        });
    } catch (error) {
      next(error);
    }
  },

  ordercomplete: async (req, res) => {
    try {
      res.render('user/ordercomp')

    } catch (error) {

    }
  },
  vieworder: async (req, res) => {
    try {
      console.log(req.session.user._id, "user session working..");//here we giving the _id to get the id of the user,we can give the user only not a problem
      orderModel.find({ userid: req.session.user._id.toString(),order_status:{$ne:'pending'}}).populate('productt.product_id').sort({ordered_date:-1}).then((orderDetails) => {
        console.log(orderDetails, "orderdetails working");
        res.render('user/vieworder', { orderDetails, user: req.session.user })

      })
    


    } catch (error) {
      next(error)

    }
  },
  singleorder: async (req, res, next) => {

    console.log("single ordeer details coming");
    
    try {
      let orderDetails = await orderModel.findOne({ _id: req.params.id }).populate('productt.product_id').then((orderDetails) => {
        console.log(orderDetails, "999999999999999999999");
        res.render('user/singleorder', { orderDetails, user: req.session.user })

      })



    } catch (error) {
      next(error)

    }
  },
  verifypayment: async (req, res) => {
    try {
      console.log("verifypayment started...");
      console.log(req.body.orders + "888888888888888888");
      const response = JSON.parse(req.body.orders)
      console.log(response + "222222222222");
      let hamc = crypto.createHmac('sha256', process.env.KEY_SECRET)
      hamc.update(response.raz_oid + '|' + response.raz_id)
      hamc = hamc.digest('hex')
      if (hamc == response.raz_sign) {
        console.log("insid++++++++++++++++++++++++++++++++++++++++++++++++");
        orderModel
          .updateOne(
            { _id: response.id },
            {
              $set: {
                order_status: "completed",
                "payment.payment_status": "completed",
                "payment.payment_id": response.raz_id,
                "payment.payment_order_id": response.raz_oid,
                "payment.payment_method": "Online_payment",
                "delivery_status.ordered.state": true,
                "delivery_status.ordered.date": Date.now(),
              },
            }
          ).then(() => {
            res.json('ONLINEPAYMENT')
          })
      } else {
        res.json('failed')
      }


    } catch (error) {

    }
  },



  wishList: async (req, res) => {
    let user = req.session.user;
    let userId = req.session.user._id;
    let wishlistData = await WishlistModel.findOne({ user1: userId }).populate(
      "product1"
    );
    let wishlist = wishlistData
    console.log(wishlist, "Wishlistpage showing..");
    res.render("user/wishlist", { user, wishlist, pdtss: wishlistData.product1 });
  },
  addToWishlist: async (req, res) => {
    let userId = req.session.user._id
    console.log(userId, "userid comesssssss");
    let proId = req.body.id;
    console.log(proId);
    let wishlist = await WishlistModel.findOne({ user1: userId });
    console.log(wishlist, "dfgh");
    if (wishlist) {
      await WishlistModel.findOneAndUpdate(
        { user1: userId },
        { $addToSet: { product1: proId } }
      );
      res.json('Produt');
    } else {
      userWishlist = {
        user1: userId,
        product1: [proId]
      };
      let newwishlist = await WishlistModel.create(userWishlist);
      console.log(newwishlist);
      res.json('Product added successfully');
    }

    // res.redirect("/");
  },
  removewishlist: async (req, res) => {
    try {
      user = req.session.user
      // console.log(user._id);
      console.log(req.body.wishid + 'wishid');
      console.log(req.body.id + 'hi');
      await WishlistModel.updateOne({ _id: req.body.wishid }, { $pull: { product1: req.body.id } })

      res.json('removed')

    } catch (error) {

    }

  },
  about:async(req,res)=>{
    try {
      user=req.session.user
      res.render('user/about',{user})
    } catch (error) {
      next(error)
      
    }
  },
  contact:async(req,res)=>{
    try {
      user=req.session.user
      res.render('user/contact',{user})
      
    } catch (error) {
      next(error)
      
    }
  }
}