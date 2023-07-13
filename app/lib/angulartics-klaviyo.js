(function(window, angular, undefined) {'use strict';

/**
 * @ngdoc overview
 * @name angulartics.klaviyo
 * Enables analytics support for klaviyo (http://klaviyo.com)
 */
angular.module('angulartics.klaviyo', ['angulartics'])
.config(['$analyticsProvider', function ($analyticsProvider) {

  angulartics.waitForVendorApi('_learnq', 500, function (_learnq) {

    $analyticsProvider.registerSetUserProperties(function (data) {
      var names = data.displayname.split(" ");
      _learnq.push(['identify', {
        '$email': data.email,
        '$first_name': names[0],
        '$last_name': names[1], 
      }]);
    });

    $analyticsProvider.registerPageTrack(function (path) {
      // console.log('Page tracking: ', path);
      // _learnq.push( "Page Viewed", { "page": path } );
    });
    $analyticsProvider.registerEventTrack(function (action, properties, callback) {
      // console.log("Event tracking: ", action, properties , callback);
      switch(action){
        case 'Viewed Product':
          var item = {
            ProductName: properties.title,
            ProductID: properties.id,
            Categories: properties.category, // The list of categories is an array of strings. 
            ImageURL: properties.image_url,
            URL: properties.url,
            Brand: properties.author
          };
          if(properties.original_price){
            item.CompareAtPrice = properties.original_price; // If you have a compare at price. You could also include this for a sale or special price.
            item.Price = properties.price;
          } else {
            item.Price = properties.price;
          }

          var trackViewedItem = {
             Title: item.ProductName,
             ItemId: item.ProductID,
             Categories: item.Categories,
             ImageUrl: item.ImageURL,
             Url: item.URL,
             Metadata: {
               Brand: item.Brand,
             }
          }
          if(properties.original_price){
            trackViewedItem.Metadata.CompareAtPrice = properties.original_price; // If you have a compare at price. You could also include this for a sale or special price.
            trackViewedItem.Metadata.Price = properties.price;
          } else {
            trackViewedItem.Metadata.Price = properties.price;
          }

          _learnq.push(['track', 'Viewed Product', item]);
          _learnq.push(['trackViewedItem', trackViewedItem]);
        break;

        case 'Started Checkout':
          // var productsTitles = [];
          // var items = [];
          // angular.forEach(properties.cart, function (cart) {
          //   productsTitles.push(cart.course_title);
          //   items.push({
          //       "SKU" : cart.course_id,
          //       "ProductName" : cart.course_title,
          //       "Quantity" : 1,
          //       "ItemPrice" : cart.price,
          //       "RowTotal" : cart.price*1,
          //       "ProductURL" : cart.course_url,
          //       "ImageURL" : cart.image_url,
          //       "ProductCategories" : [cart.category_id] //FIX: should be name not id
          //   });
          // });

          // var item = {
          //   "$event_id" : properties.cart[0].session_id, // The cart ID if you have it. Otherwise remove this line.
          //   "$value" : properties.model.original_amount,
          //   "ItemNames" : productsTitles,
          //   "CheckoutURL": properties.checkoutURL,
          //   "Items" : items
          // }
   
          _learnq.push(['track', 'Started Checkout', properties]);
        break;
        case 'Placed Order':
          // console.log(properties);
          _learnq.push(['track', 'Placed Order', properties]);
          angular.forEach(properties.Items, function (Item) {
            var item = {
                  "$event_id" : Item.$event_id,
                  "$value" : Item.ItemPrice,
                  "ProductName" : Item.ProductName,
                  "Quantity" : 1,
                  "ProductURL" : Item.ProductURL,
                  "ImageURL" : Item.ImageURL,
                  "ProductCategories" : Item.Categories,
                  "ProductBrand" : Item.Brand
            };
            // console.log(item);
            _learnq.push(['track', 'Ordered Product', item]);
          });
        break;
      }

    });

  });

}]);

})(window, window.angular);