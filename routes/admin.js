var express = require('express');
var router = express.Router();
var mongoose= require('mongoose')
var Product = require('../models/products');
var app = express()

/* GET users listing. */

router.get('/', async(req,res)=>{
  const productData = await Product.find().lean();
 // res.json(productData)
  //console.log(productData)
  res.render('admin/view-products',{admin:true,data: productData })
  
})
  //res.render('admin/view-products',{admin:true,Data:productData})
router.get('/add-product',function(req,res){
res.render('admin/add-product',{admin:true})
})
router.post('/add-product', async(req, res)=>{
  var newProduct = new Product({
    name: req.body.Name,
    category: req.body.Category,
    price: req.body.Price,
    description: req.body.Description,
    image: req.body.Image,
  });
  console.log(newProduct)
  let id=newProduct.id;
  let image=req.files.Image
  //console.log(image)
  //console.log(id)
  image.mv('C:/Users/Rojin/OneDrive/Desktop/shoping cart/public/product-images/'+id+'.jpg',(err,done)=>{
    if(!err){
      console.log('image saved successfully');
    }else{
      console.log(err)
    }
  })
  try {
    await newProduct.save();
    console.log('Data saved successfully');
    res.render("admin/add-product")
} catch (error) {
    res.status(500).send('Error saving data');
}
  //console.log(req.files.Image)
})

router.get('/delete-product/:id',async(req, res)=>{
  let proId=req.params.id
  console.log(proId)
  try {
    Product.deleteOne({ _id: proId })
    .then(result => {
        console.log(result);
        res.redirect('/admin/')
        // result.deletedCount will be 1 if the document was deleted successfully
    })
    .catch(err => {
        console.error(err);
    });
  } catch (error) {
    // Handle any errors that occur during the query
    console.error('Error deleting product:', error);
  }
})

router.get('/edit-product/:id',async(req,res)=>{
  
  await Product.findOne({ _id: req.params.id }).lean().then(product=>{
   //console.log(product)
   res.render('admin/edit-product',{product})
  }).catch(err => {
        console.error(err);
    });
})
 
router.post('/edit-product/:id', async (req, res) => {
  const productId = req.params.id;
  const { Name, Category, Price, Description } = req.body;

  try {
      const updatedProduct = await Product.updateOne(
          { _id: productId },
          {
              $set: {
                  name: Name,
                  category: Category,
                  price: Price,
                  description: Description
              }
          }
      ).then(product=>{
      console.log('Successfully changed the product')
      console.log(product);
      if(req.files && req.files.Image){
        let image=req.files.Image
        image.mv('C:/Users/Rojin/OneDrive/Desktop/shoping cart/public/product-images/'+productId+'.jpg',(err)=>{
          if (err) {
            console.error('Error saving image:', err);
            return res.status(500).send('Failed to upload image');
        }else{
          console.log('Image uploaded successfully');
          res.redirect('/admin'); // Redirect to admin page upon successful update and upload
        }
        
        });
      }else{
        res.redirect('/admin');// Redirect to admin page if no image was uploaded
      }
    });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false  
  }
  
})
module.exports = router;
