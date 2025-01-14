// models/cart.js

const mongoose = require('mongoose');
var Product = require('../models/products');
const { response } = require('express');

const itemSchema = new mongoose.Schema({
  productId:String,
  quantity:Number,
  price:Number
})

const cartSchema = new mongoose.Schema({
    user:String,
    products: [itemSchema]
});

const Cart = mongoose.model('carts', cartSchema);
module.exports={
addToCart:(proId,userId,res)=>{ 
//console.log(proId)
//console.log(userId)
return new Promise(async(resolve,reject)=>{
    let userCart = await Cart.findOne({ user: userId});
    if(userCart){
      let proExist=userCart.products.findIndex(product=>product.productId==proId)
      console.log(proExist)
      if(proExist!=-1){
        await Cart.updateOne(
          { user:userId,'products.productId': proId },
          {
              $inc: {
                  'products.$.quantity':1
              }
          }
      ).then(()=>{
        console.log('success inc quantity')
        resolve()
      })
      }else{
            await Cart.updateOne(
            { user: userId },
            {
                
                    $push:{products:[{
                      productId:proId,
                      quantity:1,
                      //price:Number 
                    }]}
                
            }
        ).then((response)=>{
        console.log('Successfully update the cart')
        resolve()
        ;})
      }
     
    }else{
          var newCart = new Cart({
            user: userId,
            products:[{
              productId:proId,
              quantity:1,
              //price:Number
          }],
            
          });
          //console.log(newCart)
          try {
             await newCart.save().then((response)=>{
             console.log('Data saved successfully');
             resolve()    
            });
           
          } catch (error) {
            res.status(500).send('Error saving data');
          }
    }
})
},viewToCart: async (userId,res) => {
  let product_array=[]
  let TotalOfproduct=0
  return new Promise(async(resolve,reject)=>{
    try {
      await Cart.findOne({ user: userId }).lean().then((product)=>{
        return product 
    }).then(async(product)=>{
        let product_id=product.products
        for (let i = 0; i < product_id.length; i++) {
            await Product.findOne({ _id: product_id[i].productId }).lean().then((product_list)=>{
            const Eachprice=parseInt(product_list.price)
            const Eachproduct=parseInt(product_id[i].quantity)
            const Totalproduct=Eachprice*Eachproduct
            TotalOfproduct=TotalOfproduct+Totalproduct
            product_list.cartId = product._id;
            product_list.quantity = product_id[i].quantity;
            product_list.Totalproduct=Totalproduct        
            product_array.push(product_list);
         })
      }
        })
    
      } catch (error) {
        console.log(error.message);
      }
      console.log(TotalOfproduct)
      console.log(product_array)
      resolve(product_array)
})

},getCartCount:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let count=0
    let cart=await Cart.findOne({user :userId})
    if(cart){
      count=cart.products.length
    } 
    console.log(count)
    resolve(count)
  });

},changeProductQuantity:(details)=>{
  details.count=parseInt(details.count)
  details.quantity=parseInt(details.quantity)
  //console.log('cart'+details.cart)
  //console.log('product'+details.product)
  //console.log(details.count)
  return new Promise(async(resolve,reject)=>{
    //console.log('hai are uou enter')
    if(details.count==-1 && details.quantity==1){
      await Cart.updateOne(
        { _id:details.cart },
        {
            $pull: {
                products:{
                  productId:details.product
                }
            }
        }
    ).then(()=>{
      console.log('success delete quantity')
      resolve({removeProduct:true})
    }).catch((error)=>{
      console.log(error)
    })
    }else{
    await Cart.updateOne(
      { _id:details.cart, 'products.productId': details.product },
      {
          $inc: {
              'products.$.quantity':details.count
          }
      }
  ).then((response)=>{
    console.log('success inc quantity')
    resolve({status:true})
  }).catch((error)=>{
    console.log(error)
  })  }
  })
},
getTotalAmount:(userId)=>{
  let product_array=[]
  let TotalOfproduct=0
  return new Promise(async(resolve,reject)=>{
      try {
        await Cart.findOne({ user: userId }).lean().then((product)=>{
          return product 
      }).then(async(product)=>{
          let product_id=product.products
          for (let i = 0; i < product_id.length; i++) {
              await Product.findOne({ _id: product_id[i].productId }).lean().then((product_list)=>{
              const Eachprice=parseInt(product_list.price)
              const Eachproduct=parseInt(product_id[i].quantity)
              const Totalproduct=Eachprice*Eachproduct
              TotalOfproduct=TotalOfproduct+Totalproduct
              product_list.cartId = product._id;
              product_list.quantity = product_id[i].quantity;
              product_list.Totalproduct=Totalproduct        
             // console.log(Eachproduct);
              //console.log(Eachprice);
              //console.log(Totalproduct);
              product_array.push(product_list);
           })
        }
          })
      
        } catch (error) {
          console.log(error.message);
        }
        console.log(TotalOfproduct);
        console.log(product_array)
        resolve(product_array)
})
},getTotalProductAmount:(userId)=>{
  let TotalOfproduct=0
  return new Promise(async(resolve,reject)=>{
      try {
        await Cart.findOne({ user: userId }).lean().then((product)=>{
          return product 
      }).then(async(product)=>{
          let product_id=product.products
          for (let i = 0; i < product_id.length; i++) {
              await Product.findOne({ _id: product_id[i].productId }).lean().then((product_list)=>{
              const Eachprice=parseInt(product_list.price)
              const Eachproduct=parseInt(product_id[i].quantity)
              const Totalproduct=Eachprice*Eachproduct
              TotalOfproduct=TotalOfproduct+Totalproduct
            
           })
        }
          })
      
        } catch (error) {
          console.log(error.message);
        }
        console.log(TotalOfproduct);
        resolve(TotalOfproduct)
})
},
getTotalAmountValue:(userId)=>{
  let product_array=[]
  let TotalOfproduct=0
  return new Promise(async(resolve,reject)=>{
      try {
        await Cart.findOne({ user: userId }).lean().then((product)=>{
          return product 
      }).then(async(product)=>{
          let product_id=product.products
          for (let i = 0; i < product_id.length; i++) {
              await Product.findOne({ _id: product_id[i].productId }).lean().then((product_list)=>{
              const Eachprice=parseInt(product_list.price)
              const Eachproduct=parseInt(product_id[i].quantity)
              const Totalproduct=Eachprice*Eachproduct
              //product_list.Totalproduct=Totalproduct
              product_array.push(Totalproduct);
                      
           })
        }
          })
      
        } catch (error) {
          console.log(error.message);
        }
        resolve(product_array)
})
},placeOrder:(order,products,total)=>{
  return new Promise(async(resolve,reject)=>{
  console.log(order,products,total)
  
})
},
getCartProductList:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let cart = await Cart.findOne({user :userId})
    console.log(cart.products)
    resolve(cart.products)
  })
},removeOne:(userId)=>{
return new Promise(async(resolve,reject)=>{
  await Cart.deleteOne({ user: userId }).then(()=>{
    console.log('delete successfully')
    resolve()
  })
})
}
}

       /*

  ,viewToCart: async (userId,res) => {
    let product_array=[]
    return new Promise(async(resolve,reject)=>{
        try {
         let cartItems = await Cart.aggregate([
          {
             $match:{user: userId}
          },/*{
             $unwind: '$products'
          },{
            $project:{
              productId:'$products.productId',
              quantity:'$products.quantity'
            }
          },{
            $lookup:{
              from: Product,
              let: { productId: '$products.productId' }, // Define variables for localField and foreignField
              pipeline: [
                  {
                      $match: {
                          $expr: {
                              $eq: ['$_id', '$$productId'] // Match _id of Product with productId from Cart
                          }
                      }
                  }
              ],
              //localField:'productId',
              //foreignField:'_id',
              as:'products'
            }
          },{
            $addFields: {
                'products': { $arrayElemAt: ['$products', 0] } // Extract the first element of 'products' array
            }
        },
        {
            $project: {
                productId: '$products._id',
                quantity: '$products.quantity'
            }
        }
  
         ]).exec()
         console.log(cartItems)
  
        } catch (error) {
          console.log(error.message);
        }
        //console.log(product_array)
        //resolve(product_array)
  });
  
  }*/