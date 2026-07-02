const Product = require('../models/Product');
const SilverPrice = require('../models/SilverPrice');

//__Whitelist: only safe public fields______________________________
const PUBLIC_FIELDS = 'sku name slug category purity weightGram netweightGram finish gender collectionName hasStone stones size stutus stockQty fixedRetailPrice retailMarkup laborCost qrCode isFeatured isNewArrival isBestSeller images description tags createdAt';

// compute public retail price(never expose cost/wholesale)
const publicPrice = (p,silver) => {
    const w = p.netWeightGram|| p.weightGram;
    const mat = w * silver + (p.laborCost || 0) + (p.stoneCost|| 0);
    return p.fixedRetailprice || parseFloat((mat * (1 +(p.retaiMarkup|| 150)/100)).toFixed(2));

};

// strip internal fields before sending to public

const toPublic =(p, silver) =>({
    id : p._id,
    sku : p.sku,
    slug :p.slug,
    name: p.name,
    catrgory:p.category,
    purity : p.purity,
    weightGram: p.weightGram,
    finish : p.finish,
    gender : p.gender,
    collection: p.collection,
    hasStone: p.hasStone,
    size : p.size,
    image :p.images?.[0] || null,
    images : p.images||[],
    qrCodes: p.qrCode,
    description : p.description,
    tags : p.tags||[],
    isFeatured : p.isFeatured,
    isNewArrival: p.isNewArrival,
    isBestSeller : p.isBestSeller,
    price : publicPrice(p,silver),
    available: p.stockQty > 0? 'in_stock' : 'made_to_order',
});

//GET//api/public/catalog______________
const getCatalog = async (req,res) =>{
    try{
        const {
            category, purity, gender, finish,
            minPrice, maxPrice, search, sortBy ='newest',
            page = 1, limit =12,
            isFeatured, isNewArrival, isBestSeller,
        } =req.query;

        //only show active, in-catalog products
        const filter = {status: {$in:['active', 'low_stock']}};
        if (category) filter.category =category;
        if (purity) filter.purity = purity;
        if (gender) filter.gender = gender;
        if (finish) filter.finish = finish ;
        if (isFeatured === 'true') filter.isFeatured = true;
        if (isNewArrival === 'true') filter.isNewArrival = true;
        if (isBestSeller === 'true') filter.isBestSeller = true;
        if(search) filter.$text = {$search: search};

        const silver = await SilverPrice.getAtive();
        

        //sort options
        const sortMap = {
            newest : {createdAt: -1},
            oldest : {createdAt : 1},
            name_asc : {name : 1},
            name_desc : {name : -1},
            weight_asc : {weightGram: 1},
            weight_dasc : {weightGram: -1}
        };

        const sort = sortMap[sortBy] || sortMap.newest;

        const skip = (Number(page) - 1) * Number(limit);
        let products = await Product.find(filter)
        .select(PUBLIC_FIELDS)
        .sort(sort)
        .lean();

        // MAP to public + compute price
        let mapped = products.map(p=> toPublic(p, silver));

        // price filter( After computing live price)
        if (minPrice) mapped =mapped.filter(p => p.price >= parseFloat(minPrice));
        if (maxPrice) mapped =mapped.filter(p => p.price <= parseFloat(maxPrice));

        //price sort (after computing)
        if (sortBy === 'price_asc') mapped.sort((a,b) => a.price - b.price);
        if (sortBy ==='price_desc') mapped.sort((a,b) => a.price -b.price);

        const total = mapped.length;
        const paged = mapped.slice(skip, skip + Number(limit));

        res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      silverPrice: silver,
      data:    paged,
    });

    } catch (err){
        res.status(500).json({success: false, message: err.message});
    }
};

//__get /api/public/product/:id__________________
const getPublicProduct = async(req,res) => {
    try{
        const silver= await SilverPrice.getActive();
        const product = await Product.findOne({
            _id: req.params.id,
            status :{$in: ['active','low_stock']},
        }).select(PUBLIC_FIELDS).lean();
        if(!product)
            return res.status(404).json({
        success: true,
        silverPrice : silver,
        data : toPublic(product,silver),
    });
    } catch(err) {
        res.status(500).json({ 
        success: false,
        message : err.message
    });
    }
};

//_________GET/ api/ public/categories________
const getCategories =async (req,res) => {
    try{
        const cats = await Product.aggregate([
            {$match : {status: {$in: ['active','low_stock']}}},
            {$group : {_id: '$category', count: { $sum: 1}}},
            {$sort: {count: -1}},
        ]);
        req.status(200).json({
            success: true,
            data: cats.map(c => ({ cayegory : c._id, count:c.count})),
        })

    } catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
};

//__GET/api/puclic/silver/price____________
const getSilverPrice = async (req,res) => {
    try {const silver = await SilverPrice.getActive();
        res.status(200).json({
            success: true,
            gramPrice: silver
        })
    } catch (err) {
        res.status(500).json({
            success:false,
            message: err.message
        });
    }
};



module.exports = {getCatalog, getPublicProduct, getCategories, getSilverPrice};
