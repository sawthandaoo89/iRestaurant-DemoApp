var express = require('express');
var router = express.Router();


//yelp
require("yelp")
var Yelp = require('yelp');
var yelp = new Yelp({
    consumer_key: '<<enter consumer key>>',
    consumer_secret: '<<enter consumer_secret>>',
    token: '<<enter token>>',
    token_secret: '<<enter token_secret>>',
});
// Mongoose import
var mongoose = require('mongoose');
require('../models/models');
var Business = mongoose.model('Business');


/* Home */
router.get('/', function (req, res) {
    var currentCity = 'Singapore';// to find current location later on
    res.redirect("/search?country=" + currentCity);
});


/* Search */
router.get('/search', function (req, res) {
    /* Search at yelp first */
    console.log(req.query.country);

    yelp.search({ term: req.query.key, location: req.query.country })
        .then(function (data) {

            var jsonString = JSON.stringify(data);
            jsonBussObj = JSON.parse(jsonString).businesses;
            jsonBussObj.sort(function (a, b) {
                return parseFloat(b.rating) - parseFloat(a.rating);
            });

            res.render('searchresult', { title: 'iResturant', items: jsonBussObj, selectedCountry: req.query.country, key: req.query.key });
            var l = jsonBussObj.length;
            for (var i = 0; i < l; i++) {
                var bussiObj = jsonBussObj[i];
                var newBusiness = new Business();

                newBusiness.is_claimed = bussiObj.is_claimed;
                newBusiness.rating = bussiObj.rating;
                newBusiness.mobile_url = bussiObj.mobile_url;
                newBusiness.rating_img_url = bussiObj.rating_img_url;
                newBusiness.review_count = bussiObj.review_count;
                newBusiness.name = bussiObj.bussiObj;
                newBusiness.rating_img_url_small = bussiObj.rating_img_url_small;
                newBusiness.url = bussiObj.url;
                newBusiness.categories = bussiObj.categories;
                newBusiness.phone = bussiObj.phone;
                newBusiness.snippet_text = bussiObj.snippet_text;
                newBusiness.image_url = bussiObj.image_url;
                newBusiness.snippet_image_url = bussiObj.snippet_image_url;
                newBusiness.display_phone = bussiObj.display_phone;
                newBusiness.rating_img_url_large = bussiObj.rating_img_url_large;
                newBusiness.id = bussiObj.id;
                newBusiness.is_closed = bussiObj.is_closed;
                newBusiness.location = bussiObj.location;
 
                console.log(newBusiness.location);


                newBusiness.save(function (err) {
                    if (err) {
                        console.log('Error in Saving user: ' + err);

                    }
                });


            }
            console.log('Done saving to database.');


        })
        .catch(function (err) {
            console.error(err);
            var searchQuery = {};
            searchQuery.id = { $regex: req.query.key, $options: 'i' };
            Business.find(searchQuery, {}, function (err, docs) {

                res.render('searchresult', { title: 'iResturant', items: docs, selectedCountry: req.query.country, key: req.query.key });

            });
        });

});

/* GET detail page. */
router.get('/viewDetail', function (req, res) {
    var searchQuery = {};
    searchQuery.id = { $regex: req.query.itemid, $options: 'i' };
    Business.findOne(searchQuery, {}, function (err, result) {
        if(result.is_closed) result.status="Closed Now";
        else result.status="Open Now";
        res.render('details', { title: 'iResturant', item: result });

    });

});

/* GET map page. */
router.get('/map', function (req, res) {
    res.render('index', { title: 'iResturant', lat: req.query.lat, log: req.query.log });
});

module.exports = router;
