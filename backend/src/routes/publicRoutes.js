const express = require('express');
const { getCatalog, getPublicProduct, getCategories, getSilverPrice } = require('../controllers/publicController');

const router = express.Router();

//No Auth Middleware- these are public
router.get('/catalog', getCatalog);
router.get('/catagories', getCategories);
router.get('/silver-price', getSilverPrice);
router.get('/product/:id', getPublicProduct);


module.exports = router;
