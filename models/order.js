// models/order.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
        mobile:String,
        address:String,
        pincode:String
})

const orderSchema = new mongoose.Schema({
    deliveryDetails: [itemSchema],
    userId:String,
    PaymentMethod:String,
    products:[{
        productId: String,
        quantity: Number,
        
      }],
    totalAmount:Number,  
    status:String,
    date:Date


});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
