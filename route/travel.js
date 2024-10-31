const path = require('path');

const express = require('express')

const shopController = require('../controller/travel');

const helper = require('../middleware/is-auth')

const router = express.Router();

router.get('/tours', shopController.getProducts);

router.get('/mountain', shopController.getMountain)

router.get('/beach', shopController.getBeach)

router.get('/city', shopController.getCity)



router.get('/tours/:travelId',  shopController.getProduct);





router.get('/add-tour', shopController.getAddProduct);

router.post('/travel/delete-tour', shopController.postDeleteProduct);

router.post('/cart-delete-item', shopController.cartDelete)

router.get('/cart', helper, shopController.getCart);

router.post('/create-order', helper, shopController.postOrder)

router.get('/orders', helper, shopController.getOrders)

router.post('/cart', helper, shopController.postCart);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/add-tour', shopController.getAddProduct)

// router.post('/travel/delete-tour', shopController.postDeleteProduct);

router.get('/edit-product/:productId',  shopController.getEditProduct);

// router.post(
//     '/edit-product',

//     helper,
//     shopController.postEditProduct
//   );


router.get('/checkout/cancel', shopController.getCheckout);

router.get('/checkout', helper, shopController.getCheckout)
module.exports = router;