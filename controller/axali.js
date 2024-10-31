



  // exports.getCheckout = (req, res, next) => {
  //   const isAdmin = req.session.user && req.session.user.isAdmin || false;
  //   let products;
  //   let total = 0
  //   req.user
  //     .populate("cart.items.productId")
  //     .then((user) => {
  //       products = user.cart.items;
  //       total = 0
  //       products.forEach( p => {
  //         total +=p.quantity * p.productId.price
  //       })
  
  //       return stripe.checkout.sessions.create({
  //         payment_method_types: ['card'],
  //         line_items: products.map(p => {
  //           return {
  //             price_data: {
  //               currency: 'usd',
  //               product_data: {
  //                 name: p.productId.name,
  //                 description: p.productId.description,
                 
  //               },
  //               unit_amount: p.productId.price * 100,
  //             },
  //             quantity: p.quantity,
  //           };
  //         }),
  //         mode: 'payment',
  //         success_url: req.protocol + '://' + req.get('host') + '/checkout/success', 
  //         cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
  //       });
  //     })
  //     .then( session => {
  //       res.render("checkout", {
  //         path: "/checkout",
  //         totalSum: total ,
  //         products: products,
  //         isAuthenticated: req.session.isLoggedIn,
  //         isAdmin: isAdmin,
  //         sessionId:session.id
  //       });
  //     } )
  //     .catch((err) => console.log(err));
  // }
  

  exports.getCheckout = (req, res, next) => {
    const isAdmin = req.session.user && req.session.user.isAdmin || false;
    let products;
    let total = 0
    req.user
      .populate("cart.items.productId")
      .then((user) => {
        products = user.cart.items;
        console.log('products', products);
        total = 0;
        products.forEach(p => {
          if(p.productId){
            total += p.quantity * p.productId.price;
  
          }
        });
  
  
        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map(p => {
            return {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: p.productId ? p.productId.name : 'Unknown Product',
                 
                 
                },
                unit_amount:p.productId ? p.productId.price * 100 : 0,
              },
              quantity: p.quantity,
            };
          }),
          mode: 'payment',
          success_url: req.protocol + '://' + req.get('host') + '/checkout/success', 
          cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
        });
      })
      .then( session => {
        res.render("checkout", {
          path: "/checkout",
          totalSum: total ,
          products: products,
          isAuthenticated: req.session.isLoggedIn,
          isAdmin: isAdmin,
          sessionId:session.id
        });
      } )
      .catch((err) => console.log(err));
  }

  // <main class="page">
  //   <div class="shopping-cart">
  //     <div class="container">
  //       <div class="content">
  //         <div class="row">
  //           <div class="col-md-12 col-lg-8">
  //             <div class="items">
               
  //                 <% products.forEach(p => { %>
  //                   <div class="product" style="margin-top: 100px;">
  //                     <div class="row">
  //                       <div class="col-md-3">
  //                         <img src="/<%= p.productId.images[0] %>" class="img-fluid mx-auto d-block image" id="image">
  //                       </div>
  //                       <div class="col-md-8">
  //                         <div class="info">
  //                           <div class="row">
  //                             <div class="col-md-5 product-name">
  //                               <div class="product-name">
  //                                 <div class="product-info">
  //                                   <div>Name: <span class="value"><%= p.productId.name %></span></div>
  //                                   <div>Price: <span class="value"><%= p.productId.price %></span></div>
  //                                   <form action="/cart-delete-item" method="POST">
  //                                     <input type="hidden" value="<%= p.productId._id %>" name="productId">
  //                                     <button class="btn" style="font-size: 20px;" type="submit">Delete;</button>
  //                                   </form>
  //                                 </div>
  //                               </div>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 <% }) %>
               
  //             </div>
  //           </div>
  //           <div class="col-md-12 col-lg-4">
  //             <div class="summary">
  //               <h3>Summary</h3>
  //               <% if (products.length > 0) { %>
  //                 <div class="summary-item"><span class="text">Quantity</span><span class="price"><%= products.reduce((total, p) => total + p.quantity, 0) %></span></div>
  //                 <div class="summary-item"><span class="text">Total</span><span class="price">$<%= products.reduce((total, p) => total + (p.productId.price * p.quantity), 0) %></span></div>
  //                 <button type="button" class="btn btn-primary btn-lg btn-block">Checkout</button>
  //               <% } %>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // </main>