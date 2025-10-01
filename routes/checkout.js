const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isAuth } = require('./_middleware');

// Simple test route
router.get('/test', (req, res) => {
    res.send('Checkout route is working');
});

// Display checkout page
router.get('/', async (req, res) => {
    try {
        console.log('Checkout route accessed');
        console.log('User session:', req.session.userId);
        console.log('Cart:', req.session.cart);

        // Check authentication
        if (!req.session.userId) {
            console.log('User not authenticated');
            req.flash('error', 'Please login first');
            return res.redirect('/login');
        }

        // Check cart
        if (!req.session.cart || !req.session.cart.totalQty) {
            console.log('Cart empty');
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        console.log('Rendering checkout page');
        res.render('checkout', {
            cart: req.session.cart,
            user: req.session.user
        });
    } catch (error) {
        console.error('Checkout error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/cart');
    }
});

// Process checkout
router.post('/', isAuth, async (req, res) => {
    try {
        if (!req.session.cart || !req.session.cart.totalQty) {
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        const order = new Order({
            user: req.session.userId,
            items: req.session.cart.items,
            totalQty: req.session.cart.totalQty,
            totalPrice: req.session.cart.totalPrice,
            shippingAddress: {
                fullName: req.body.fullName,
                email: req.body.email,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                phone: req.body.phone
            },
            paymentInfo: {
                cardNumber: req.body.cardNumber.slice(-4), // Only store last 4 digits
                expiryDate: req.body.expiryDate
            },
            status: 'pending'
        });

        await order.save();

        // Clear the cart after successful order
        req.session.cart = null;
        
        req.flash('success', 'Order placed successfully!');
        res.redirect('/orders');
    } catch (error) {
        console.error('Checkout error:', error);
        req.flash('error', 'An error occurred while processing your order');
        res.redirect('/checkout');
    }
});

module.exports = router;