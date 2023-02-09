
const express=require('express')
const router=express.Router()
const controller = require('../controller/usercontroller')
const {userSession} = require('../middleware/auth')
const {ajaxSession}=require('../middleware/ajaxsession')



router.get('/login',controller.login)
router.get('/',controller.userhome)
router.get('/pdtdetails',controller.pdtdetails)
router.get('/signup',controller.signup)
router.get('/logout',controller.logoutUser)
router.get('/shop',controller.shop)



router.post("/dologin", controller.doLogin);
// router.get('/',controller.userhome)
router.post('/otp',controller.otp)
router.post('/resendotp',controller.resendotp)
router.post('/verifyotp',controller.verifyotp)
router.get('/userdetails',userSession,controller.userdetails)
router.post('/addaddress',userSession,controller.addaddress)
router.post('/deleteaddress',userSession,controller.deleteaddress)
router.post('/editaddress',userSession,controller.editaddress)
router.post('/updateaddress/:id',userSession,controller.updateaddress)
router.get('/cart',userSession,controller.cart)
router.post('/addtocart',ajaxSession,controller.addtocart)
router.post('/changequantity',ajaxSession,controller.changequantity)
router.post('/removecart',ajaxSession,controller.removeCart)
router.get('/wishlist',ajaxSession,controller.wishList)
router.post('/addtowishlist',ajaxSession,controller.addToWishlist)
router.post('/removewishlist',ajaxSession,controller.removewishlist)
router.get('/checkout/:id',userSession,controller.CheckOut)
router.post('/addcheckaddress/:id',ajaxSession,controller.addcheckaddress)
router.post('/orderdata',ajaxSession,controller.orderdata)
router.post('/cancelOrder',ajaxSession,controller.cancelOrder)
router.post('/applycoupon',ajaxSession,controller.applycoupon)
router.post('/placeorder/:id',ajaxSession,controller.placeorder)
router.get('/ordercomplete',ajaxSession,controller.ordercomplete)
router.get('/vieworder',userSession,controller.vieworder)
router.get('/singleorder/:id',userSession,controller.singleorder)
router.post('/verifypayment',ajaxSession,controller.verifypayment)
router.get('/about',controller.about)
router.get('/contact',controller.contact)

// router.post("/dosignup", controller.doSignup); 
// router.get('/otp',controller.otp)

module.exports=router
