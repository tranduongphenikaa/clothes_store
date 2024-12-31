const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
    title: String,
    product_category_id: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: Array,
    featured: String,
    status: String,
    position: Number,
    size: Array,
    createdBy: String,
    updatedBy: String,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: String,
    isLoved: [
        {
          userId: String
        }
    ],
    slug:{
        type: String,
        slug: "title",
        unique: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

productSchema.virtual('priceNew').get(function() {
    return (1 - this.discountPercentage / 100) * this.price;
});

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;