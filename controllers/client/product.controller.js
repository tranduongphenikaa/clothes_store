const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Review = require("../../models/product-review.model");
const User = require("../../models/user.model");

const paginationHelper = require("../../helpers/pagination.helper");
const ratingAverage = require("../../helpers/ratingAverage.helper");
const moment = require("moment");


// [GET] /products/
module.exports.index = async (req, res) => {
    const find = {
        status: "active",
        deleted: false
    };

    let allProducts = await Product.find(find).sort({ position: "desc" });

    // Lọc theo giá
    if (req.query.priceStart && req.query.priceEnd) {
        const priceStart = Number(req.query.priceStart);
        const priceEnd = Number(req.query.priceEnd);

        allProducts = allProducts.filter(product => {
            return product.priceNew >= priceStart && product.priceNew <= priceEnd;
        });
    }
    // Hết Lọc theo giá

    // Lọc theo size
    if(req.query.size){
        const sizeFilter = req.query.size;
        allProducts = allProducts.filter(product => {
            return product.size.includes(sizeFilter);
        });
    }
    // Hết Lọc theo size

    // Danh mục
    const categories = await ProductCategory.find({
        status: "active",
        deleted: false,
        parent_id: ""
    }).select("slug title");

    let filterCategory = "";

    if(req.query.category){
        const categoryFilter = req.query.category;

        const category = await ProductCategory.findOne({
            status: "active",
            deleted: false,
            slug: categoryFilter
        });

        filterCategory = category.title;

        const subCategory = await ProductCategory.find({
            status: "active",
            deleted: false,
            parent_id: category.id
        });

        const subCategoryIds = subCategory.map(sub => sub.id);

        allProducts = allProducts.filter(product => {
            return [
                ...subCategoryIds,
                category.id
            ].includes(product.product_category_id);
        });
    }
    // Hêt Danh mục

    // Phân trang
    const pagination = await paginationHelper.productClient(req, allProducts);

    const paginatedProducts = allProducts.slice(pagination.skip, pagination.skip + pagination.limitItems);

    for(const item of paginatedProducts){
        const reviewsItem = await Review.find({
            productId: item.id
        });

        item.reviewsCount = reviewsItem.length;

        item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
    }

    res.render("client/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: paginatedProducts,
        pagination: pagination,
        categories: categories,
        filterCategory: filterCategory
    });
};

// [GET] /products/:slugCategory
module.exports.category = async(req, res) => {
    const slugCategory = req.params.slugCategory;

    const category = await ProductCategory.findOne({
        slug: slugCategory,
        status: "active",
        deleted: false
    });

    let parentCategorySlug = "";
    let parentCategoryTitle = "";

    if(category.parent_id != ""){
        const parentCategory = await ProductCategory.findOne({
            _id: category.parent_id,
            status: "active",
            deleted: false
        });
        
        parentCategorySlug = parentCategory.slug;
        parentCategoryTitle = parentCategory.title;
    }    

    const allSubCategory = [];

    const getSubCategory = async(currentId) => {
        const subCategory = await ProductCategory.find({
            parent_id: currentId,
            status: "active",
            deleted: false
        });

        for(const sub of subCategory){
            allSubCategory.push(sub.id);
            await getSubCategory(sub.id);
        }
    }

    await getSubCategory(category.id);

    let products = await Product.find({
        product_category_id: {
            $in: [
                category.id,
                ...allSubCategory
            ]
        },
        status: "active", 
        deleted: false
    }).sort({ position: "desc" });

    for(const item of products){
        item.priceNew = ((1 - item.discountPercentage/100) * item.price).toFixed(0);
    }

    // Lọc sản phẩm theo giá
    if (req.query.priceStart && req.query.priceEnd) {
        const priceStart = Number(req.query.priceStart);
        const priceEnd = Number(req.query.priceEnd);

        products = products.filter(product => {
            return product.priceNew >= priceStart && product.priceNew <= priceEnd;
        });
    }
    // Hết Lọc sản phẩm theo giá

    // Lọc theo size
    if(req.query.size){
        const sizeFilter = req.query.size;
        products = products.filter(product => {
            return product.size.includes(sizeFilter);
        });
    }
    // Hết Lọc theo size

    const pagination = await paginationHelper.productClient(req, products);

    const paginatedProducts = products.slice(pagination.skip, pagination.skip + pagination.limitItems);

    for(const item of paginatedProducts){
        const reviewsItem = await Review.find({
            productId: item.id
        });

        item.reviewsCount = reviewsItem.length;

        item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
    }


    res.render("client/pages/products/index", {
        pageTitle: category.title,
        products: paginatedProducts,
        pagination: pagination,
        slug: slugCategory,
        title: category.title,
        parentCategoryTitle: parentCategoryTitle,
        parentCategorySlug: parentCategorySlug
    });
}

// [GET] /products/detail/:slug
module.exports.detail = async (req, res) => {
    const slug = req.params.slug;

    const product = await Product.findOne({
       slug: slug,
       deleted: false,
       status: "active" 
    });

    product.priceNew = ((1 - product.discountPercentage/100) * product.price).toFixed(0);

    // review
    const reviews = await Review.find({
        productId: product.id
    });

    for(const review of reviews){
        const user = await User.findOne({
            _id: review.userId
        });

        review.image = user.avatar;
        review.fullName = user.fullName;

        review.createdAtFormat = moment(review.createdAt).format("DD/MM/YYYY");
    }

    reviews.ratingAvg = await ratingAverage.ratingAvg(reviews);
    // End review

    // Sản phẩm tương tự
    const similarProduct = await Product.find({
        _id: {$ne: product.id},
        product_category_id: product.product_category_id,
        status: "active",
        deleted: false
    });

    for(const item of similarProduct){
        const reviewsItem = await Review.find({
            productId: item.id
        });

        item.reviewsCount = reviewsItem.length;

        item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
    }
    // Sản phẩm tương tự

    if(product){
        res.render("client/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            product: product,
            similarProduct: similarProduct,
            reviews: reviews
        });
    }
    else{
        res.redirect("/");
    }
}