
var express = require('express');
var router = express.Router();
var Product = require('../models/products');
var User = require('../models/user');
var Order = require('../models/order');
var Cart = require('../models/cart');

const bcrypt=require('bcrypt')
var app = express()
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
   next()
  }else{
   res.redirect('/login')
  }
 }


/* GET home page. */

router.get('/home',async(req,res)=>{
  Cart=await Product.find().sort({ createdAt: -1 }).limit(6).lean()
  res.render('main/home',{data:Cart})
})

router.get('/', async(req,res)=>{
  let user=req.session.user
  console.log(user)
  let CartCount=null
  if(req.session.user){
    CartCount=await Cart.getCartCount(req.session.user._id)
  } 
  console.log(CartCount)
  const productData = await Product.find().lean();
  const latest=await Product.find().sort({ _id: -1 }).limit(3).lean()
 // res.json(productData)
  //console.log(productData)
  res.render('user/view-products', {admin:false,data: productData,user,CartCount,latest:latest  });
})

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false  
  }
  
})

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',async(req, res)=>{
  var newUser = new User({
    name: req.body.Name,
    email: req.body.Email,
    password: await bcrypt.hash(req.body.Password,10),
  });
  console.log(newUser)
  try {
    await newUser.save();
    console.log('Data saved successfully');
    req.session.loggedIn=true
    req.session.user=newUser
    res.redirect("/")
  } catch (error) {
    res.status(500).send('Error saving data');
  }
})

router.post('/login',async(req, res)=>{
  let response={}
  try {
    // Assuming userData.Email contains the email you're searching for
    let user = await User.findOne({ email: req.body.Email });
    
    if (user) {
      // User found, do something with user object
      //console.log(user);
      bcrypt.compare(req.body.Password,user.password).then((status)=>{
      if(status){
        console.log('login success')
         response.user=user
         response.state=true
         console.log(response.state)
         req.session.loggedIn=true
         req.session.user=response.user
         res.redirect('/')
         
        
      }else{
        console.log('login failed')
        response.state=false
        console.log(response.state)
        req.session.loginErr="Invalid password"
        res.redirect('/login')
      }
      })
    } else {
      // User not found
      console.log('User not found');
      response.state=false
      console.log(response.state)
      req.session.loginErr="Invalid username"
      res.redirect('/login')
    }
  } catch (error) {
    // Handle any errors that occur during the query
    console.error('Error finding user:', error);
    response.state=false
    console.log(response.state)
    req.session.loginErr="Invalid opperation in database for login"
    res.redirect('/login')
  }
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  console.log('heee'+req.session.user._id)
  let product = await Cart.viewToCart(req.session.user._id)
  let totalvalue=0
  if(product.length>0){
    totalvalue = await Cart.getTotalProductAmount(req.session.user._id)
  }
   console.log(product)
   let user=req.session.user._id
   console.log(user)
   res.render('user/cart',{data :product,user,totalvalue})
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log('call')
  Cart.addToCart(req.params.id,req.session.user._id,res).then(()=>{
     res.json({status:true})
    //res.redirect('/')
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  Cart.changeProductQuantity(req.body).then(async(response)=>{
  response.total= await Cart.getTotalProductAmount(req.body.user)
   response.totalproduct=await Cart.getTotalAmountValue(req.session.user._id)  
    res.json(response)
  })
})

router.get('/place-order',verifyLogin,async(req,res,next)=>{
let product=await Cart.getTotalAmount(req.session.user._id)
let totalvalue = await Cart.getTotalProductAmount(req.session.user._id)
res.render('user/place-order',{data :product,user:req.session.user,totalvalue})
})

router.post('/place-order',async(req,res)=>{
  let products = await Cart.getCartProductList(req.body.userId)
  let totalPrice = await Cart.getTotalProductAmount(req.body.userId)
  let order=req.body
  let status =order['payment-method']==='COD'?'placed':'pending'
  let orderObj={
    deliveryDetails:{
      mobile:order.Phone,
      address:order.address,
      pincode:order.Pincode
    },
    userId:order.userId,
    PaymentMethod:order['payment-method'],
    products:products,
    totalAmount:totalPrice,
    status:status,
    date:new Date()
  }
  var newOrder = new Order(orderObj)
  await newOrder.save().then(async(response)=>{
    await Cart.removeOne(order.userId).then(()=>{
      res.json({status:true})
    })
    
  })
  })

  router.get('/order-sucess',verifyLogin,((req,res)=>{
    res.render('user/order-sucess',{user:req.session.user})
  }))

  router.get('/orders',verifyLogin,(async(req,res)=>{
    await Order.find({userId :req.session.user._id}).lean().then((order)=>{
    //console.log(order)
      res.render('user/orders',{user:req.session.user,order})   
    })
  }))

  router.get('/viewproduct/:id',verifyLogin,(async(req,res)=>{
  let product_array=[]
  let quantity_array=[]
  let orderProduct = await Order.find({ _id :req.params.id}).lean().then((order)=>{
        //console.log(order)
        return order 
    }).then(async(product)=>{
        //console.log(product)
        for (let i = 0; i < product.length; i++) {
            let product_id=product[i].products
            //console.log(product_id)
            for(let j=0;j<product_id.length;j++){
            //console.log(product_id[j].productId)
            await Product.findOne({ _id:product_id[j].productId}).lean().then((product_list)=>{
            product_array.push(product_list);
         })
            }
           
      }
      //console.log(product_array)
      return product_array
        }).catch((error)=>{
          console.log(error);})
  let orderQuantity = await Order.find({ _id :req.params.id}).lean().then((order)=>{
           // console.log(order)
            return order 
        }).then(async(product)=>{
             //console.log(product)
            for (let i = 0; i < product.length; i++) {
                let product_id=product[i].products
            for(let j=0;j<product_id.length;j++){
                //console.log(product_id[j].quantity)
                quantity_array.push(product_id[j].quantity);
          }}
          //console.log(quantity_array)
          return quantity_array
            }).catch((error)=>{
              console.log(error);})              
res.render('user/viewproduct',{user:req.session.user,data:orderProduct,quantity:orderQuantity}) 
//console.log(orderProduct)      
  }))

router.get('/home',(req,res)=>{
  res.render('main/home')
})

router.get('/productview/:id',async(req,res)=>{
  const productData = await Product.find({_id:req.params.id}).lean();
  res.render('user/productview',{data:productData,user:req.session.user})
})

  module.exports = router;

