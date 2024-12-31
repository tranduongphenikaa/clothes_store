const Product = require("../../models/product.model");
const Categories = require("../../models/product-category.model");
const Blog = require("../../models/blog.model");
const BlogCategory = require("../../models/blog-category.model");
const Review = require("../../models/product-review.model");
const Advert = require("../../models/advert.model");

const ratingAverage = require("../../helpers/ratingAverage.helper");

// [GET] /
module.exports.index = async (req, res) => {
    // Danh mục
    const categories = await Categories.find({
        status: "active",
        deleted: false,
        parent_id: ""
    });
    
    for(const category of categories){
        const subCategory = await Categories.find({
            status: "active",
            deleted: false,
            parent_id: category.id
        });

        const subCategoryIds = subCategory.map(sub => sub.id);

        const countProducts = await Product.countDocuments({
                status: "active",
                deleted: false,
                product_category_id: {
                    $in: [
                        ...subCategoryIds,
                        category.id
                    ]
                }
        });

        category.countProduct = countProducts;
    }
    // Hêt Danh mục
    
    // Sản phẩm nổi bật
    const productsFeatured = await Product.find({
        featured: "1",
        status: "active",
        deleted: false
    })
    .sort({ position : "desc" }).limit(4)
    .select("-description");

    for(const item of productsFeatured){
        item.priceNew = ((1 - item.discountPercentage/100) * item.price).toFixed(0);
        const reviewsItem = await Review.find({
            productId: item.id
        });

        item.reviewsCount = reviewsItem.length;

        item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
    }
    // Hết Sản phẩm nổi bật

    // Sản phẩm mới
    const productsNew = await Product.find({
        status: "active",
        deleted: false
    })
    .sort({ position : "desc" }).limit(4)
    .select("-description");

    for(const item of productsNew){
        item.priceNew = ((1 - item.discountPercentage/100) * item.price).toFixed(0);
        const reviewsItem = await Review.find({
            productId: item.id
        });

        item.reviewsCount = reviewsItem.length;

        item.ratingAvg = await ratingAverage.ratingAvg(reviewsItem);
    }
    // Hết Sản phẩm mới

    // Blog mới 
    const blogsNew = await Blog.find({
        status: "active",
        deleted: false
    })
    .sort({ position : "desc" }).limit(4)
    .select("-description");

    for(const item of blogsNew){
        const category = await BlogCategory.findOne({
            _id: item.blog_category_id
        });
        if(category){
            item.categoryName = category.title
        }
    }
    // Hết Blog mới

    // Quảng cáo
    const adverts = await Advert.find({
        status: "active",
        deleted: false
    });

    const carosels = adverts.slice(0, 3);
    const productOffers = adverts.slice(3, 5);
    // Hết Quảng cáo

    res.render("client/pages/home/index", {
        pageTitle: "Trang chủ",
        productsFeatured: productsFeatured,
        productsNew: productsNew,
        blogsNew: blogsNew,
        categories: categories,
        carosels: carosels,
        productOffers: productOffers
    });
}