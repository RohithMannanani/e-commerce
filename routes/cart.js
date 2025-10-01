const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Initialize cart in session if it doesn't exist
const initCart = (req) => {
  if (!req.session.cart) {
    req.session.cart = {
      items: {},
      totalQty: 0,
      totalPrice: 0
    };
  }
  return req.session.cart;
};

// View cart
router.get('/', (req, res) => {
  res.render('cart');
});

// Add to cart
router.post('/add/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const cart = initCart(req);
    const product = await Product.findById(productId);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('back');
    }

    if (cart.items[productId]) {
      cart.items[productId].qty++;
      cart.items[productId].price = product.price;
      cart.totalPrice += product.price;
    } else {
      cart.items[productId] = {
        item: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      };
      cart.totalPrice += product.price;
    }

    cart.totalQty++;
    req.flash('success', 'Item added to cart');
    
    // Redirect to the page specified in the form or default to home page
    const redirectTo = req.body.redirectTo || '/';
    res.redirect(redirectTo);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding item to cart');
    res.redirect('back');
  }
});

// Update cart item quantity
router.post('/update', (req, res) => {
  try {
    const { productId, action } = req.body;
    const cart = req.session.cart;

    if (!cart || !cart.items[productId]) {
      return res.redirect('/cart');
    }

    const item = cart.items[productId];

    if (action === 'increase') {
      item.qty++;
      cart.totalQty++;
      cart.totalPrice += item.price;
    } else if (action === 'decrease') {
      if (item.qty > 1) {
        item.qty--;
        cart.totalQty--;
        cart.totalPrice -= item.price;
      } else {
        cart.totalQty--;
        cart.totalPrice -= item.price;
        delete cart.items[productId];
      }
    }

    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error updating cart');
    res.redirect('/cart');
  }
});

// Remove item from cart
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;
    const cart = req.session.cart;

    if (!cart || !cart.items[productId]) {
      return res.redirect('/cart');
    }

    const item = cart.items[productId];
    cart.totalQty -= item.qty;
    cart.totalPrice -= (item.price * item.qty);
    delete cart.items[productId];

    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error removing item from cart');
    res.redirect('/cart');
  }
});

module.exports = router;