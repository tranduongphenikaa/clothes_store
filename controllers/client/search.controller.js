const Product = require("../../models/product.model");
const Review = require("../../models/product-review.model");
const paginationHelper = require("../../helpers/pagination.helper");
const ratingAverage = require("../../helpers/ratingAverage.helper");

// [GET] /search
module.exports.index = async(req, res) => {
    const keyword = req.query.keyword;

    let paginatedProductsSearch = [];
    let pagination = [];

    if(keyword){
        const regex = new RegExp(keyword, "i");

        const find = {
            status: "active",
            deleted: false,
            title: regex
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

        // Lọc theo size
        if(req.query.size){
            const sizeFilter = req.query.size;
            allProducts = allProducts.filter(product => {
                return product.size.includes(sizeFilter);
            });
        }
        // Hết Lọc theo size
    
        // Phân trang
        pagination = await paginationHelper.productClient(req, allProducts);
    
        paginatedProductsSearch = allProducts.slice(pagination.skip, pagination.skip + pagination.limitItems);

        for(const item of paginatedProductsSearch){
            const reviewsItem = await Review.find({
                productId: item.id
            });
    
            item.reviewsCount = reviewsItem.length;
    
            item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
        }
    }

    res.render("client/pages/search/index", {
        pageTitle: "Tìm kiếm",
        keyword: keyword,
        products: paginatedProductsSearch,
        pagination: pagination,
    });
}