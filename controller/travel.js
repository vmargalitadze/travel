const Product = require('../models/product');
const Order = require('../models/order');
const { Products } = require('stripe/lib/resources');
const stripe = require('stripe')(process.env.DB_STRIPE_KEY);
const ITEMS_PER_PAGE = 6
const Comment = require('../models/comments')

const { validationResult } = require('express-validator/check');

exports.getProducts = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const user =req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
 

  Product.find()
  .then( numProducts => {
    
    return Product.find()
    
  } ).then(products => {
    

  
      res.render('tours', {
        prods: products,
        pageTitle: 'All Products',
        path: '/tours',
        isAuthenticated: req.session.isLoggedIn,
        isAdmin: isAdmin,
        name: req.session.user ? req.session.user.name : null,
        user:user,
        cart:cart
      });
    })
    .catch(err => console.log(err));
};

exports.getMountain = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const page = +req.query.page || 1;
  const user =req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  let totalItems;

  Product.find({ category: 'Mountains' })  
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;

     
      return Product.find({ category: 'Mountains' }).sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('mountain', {
        prods: products,
        pageTitle: 'All Mountain Tours',
        path: '/tours',
        isAuthenticated: req.session.isLoggedIn,
        name: req.session.user ? req.session.user.name : null,
        isAdmin: isAdmin,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        user:user,
        cart:cart
      });
    })
    .catch(err => console.log(err));
};

exports.getBeach = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const page = +req.query.page || 1;
  const user =req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  let totalItems
  Product.find()
  .countDocuments({ category: 'Exotic Tours' })
  .then( numProducts => {
    totalItems = numProducts
    return Product.find({ category: 'Exotic Tours' }).sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then(products => {
      const productsWithDiscount = products.filter(product => product.discount > 0);

    
    
      res.render('beach', {
        prods: products,
        pageTitle: 'All Products',
        path: '/tours',
        isAuthenticated: req.session.isLoggedIn,
        name: req.session.user ? req.session.user.name : null,
        isAdmin: isAdmin,
        user:user,
        cart:cart,
        currentPage: page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page> 1,
        nextPage: page + 1,
        previousPage: page - 1 ,
        lastPage: Math.ceil( totalItems /ITEMS_PER_PAGE )
      });
    })
    .catch(err => console.log(err));
};

exports.getCity = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const page = +req.query.page || 1;
  let totalItems;
  const user =req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  
  Product.countDocuments({ category: 'Urban Adventures' })
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find({ category: 'Urban Adventures' })
        .sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('city', {
        prods: products,
        pageTitle: 'All Products',
        path: '/tours',
        isAuthenticated: req.session.isLoggedIn,
        user:user,
        cart:cart,
        name: req.session.user ? req.session.user.name : null,
        isAdmin: isAdmin,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};


exports.getProduct = (req, res, next) => {
  const travelId = req.params.travelId;
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const user = req.session.user

  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  const userId = req.user
  Product.findById(travelId)
    .then( travel=> {
      res.render('travel-detail', {
        travel: travel,
          pageTitle: 'tours',
          path: '/tours',
          isAuthenticated: req.session.isLoggedIn,
          name: req.session.user ? req.session.user.name : null,
          isAdmin: isAdmin,
          user:user,
          cart:cart,
          userId:userId
      });
    })
    .catch(err => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const user = req.session.user

  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
    res.render('add-tour', {
      pageTitle: 'add-tour',
      path: '/add-tour',
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      user:user,
      cart:cart,
      isAdmin: isAdmin
    });
  };

  exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const user = req.session.user
    const cart = req.session.user.cart
    const isAdmin = req.session.user && req.session.user.isAdmin || false;
    if (!editMode) {
      return res.redirect('/');
    }
  
    const prodId = req.params.productId;
  
    Product.findById(prodId)
      .then(product => {
        if (!product) {
          return res.redirect('/');
        }
  
        res.render('edit-product', {
          pageTitle: 'Edit Product',
          path: '/tours',
          editing: editMode,
          product: product,
          user:user,
          cart:cart,
          isAuthenticated: req.session.isLoggedIn,
          name: req.session.user ? req.session.user.name : null,
          isAdmin: isAdmin,
          validationErrors: []
        });
      })
      .catch(err => console.log(err));
  };
  




exports.postOrder = (req, res, next) => {
  req.user
  .populate("cart.items.productId")
  .then((user) => {

    const products = user.cart.items.map( i => {
      return {quantity: i.quantity,
            product: {...i.productId._doc}
      }
    });
    const order = new Order({
      user:{
       email:req.user.email,
        userId: req.user
      },
      products:products
  })
order.save()
  })
 
  .then(result => {
    req.user.clearCart();
  })
  .then( () => {
    res.redirect('/orders')
    
  })
  .catch( err => console.log(err))
}





exports.getOrders = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  Order.find({
    "user.userId":req.user._id
  }).then( orders => {
    res.render("orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
      name: req.session.user ? req.session.user.name : null,
      isAdmin: isAdmin
    })
  } )
}


exports.cartDelete = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      
      console.log(result, "removed");
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
}


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      product.peopleSize += 1;
      return product.save();
    })
    .then(updatedProduct => {
    
      

     
      return req.user.addToCart(updatedProduct);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

  exports.postDeleteProduct = (req, res, next) => {
    const travelId = req.body.travelId; 
  
    Product.findByIdAndRemove(travelId)
      .then(() => {
        
        console.log('DESTROYED PRODUCT');
        res.redirect('/tours');
      })
      .catch(err => console.log(err));
  };

exports.getCheckout = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  let products;
  const user = req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  let total = 0
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;

      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });


      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.productId.name,
                description: p.productId.description,
                peopleSize:p.productId.peopleSize
              },
              unit_amount: p.productId.price * 100,
            },
            quantity: p.quantity,
          };
        }),
        mode: 'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', 
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
        
      });
    })
    .then( session => {
      res.render("checkout", {
        path: "/checkout",
        totalSum: total ,
        products: products,
        isAuthenticated: req.session.isLoggedIn,
        user:user,
          cart:cart,
        name: req.session.user ? req.session.user.name : null,
        isAdmin: isAdmin,
        sessionId:session.id
      });
    } )
    .catch((err) => console.log(err));
}

exports.getCart = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const user = req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      let total = 0;

      if (products.length === 0) {
     
        return res.render("cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          isAuthenticated: req.session.isLoggedIn,
          name: req.session.user ? req.session.user.name : null,
          isAdmin: isAdmin,
          totalSum: total,
          user:user,
          cart:cart,
          products: products,
         
        });
      }

      
      products.forEach(p => {
        const discountedPrice = p.productId.discount
        ?  (p.productId.discount / 100) * p.productId.price
        : p.productId.price;
      

      total += p.quantity * discountedPrice;
      p.discountedPrice = discountedPrice; 
      });

      
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.productId.name,
               
              },
              unit_amount: p.discountedPrice * 100,
            },
            quantity: p.quantity,
          };
        }),
        mode: 'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      })
      .then(session => {
        res.render("cart", {
          path: "/cart",
          pageTitle: "Your Cart",
          products: products,
          isAuthenticated: req.session.isLoggedIn,
          name: req.session.user ? req.session.user.name : null,
          isAdmin: isAdmin,
          user:user,
          cart:cart,
          totalSum: total,
          sessionId: session.id,
        });
      })
    })
    .catch((err) => console.log(err));
};




exports.getCheckoutSuccess = (req, res, next) => {
  req.user
  .populate("cart.items.productId")
  .then((user) => {
   
    const products = user.cart.items.map( i => {
      return {quantity: i.quantity,
            product: {...i.productId._doc}
      }
    });
    const order = new Order({
      user:{
       email:req.user.email,
        userId: req.user
      },
      products:products
  })
order.save()
  })
 
  .then(result => {
    req.user.clearCart();
  })
  .then( () => {
    res.redirect('/orders')

  })
  .catch( err => console.log(err))
}

  

exports.getAddProduct = (req, res, next) => {
  const isAdmin = req.session.user && req.session.user.isAdmin || false;
  const user = req.session.user
  const cart = req.session.user && req.session.user.cart ? req.session.user.cart : null;
    res.render('add-tour', {
      pageTitle: 'add-tour',
      path: '/add-tour',
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      name: req.session.user ? req.session.user.name : null,
      isAdmin: isAdmin,
      cart:cart,
      user:user
    });
  };




  
  