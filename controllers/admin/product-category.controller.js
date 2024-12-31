const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const moment = require('moment');

const createTreeHelper = require("../../helpers/createTree.helper");
const paginationHelper = require("../../helpers/pagination.helper");

// [GET] /admin/products-category/
module.exports.index = async (req, res) => {
    const find = {
      deleted: false
    };

    const filterStatus = [
      {
        label: "Tất cả",
        value: ""
      },
      {
        label: "Hoat động",
        value: "active"
      },
      {
        label: "Dừng hoạt động",
        value: "inactive"
      }
    ];

    if(req.query.status){
      find.status = req.query.status;
    }

    // Tìm kiếm
    let keyword = "";
    if(req.query.keyword){
      const regex = new RegExp(req.query.keyword, "i");
      find.title = regex;
      keyword = req.query.keyword;
    }
    // Hết tìm kiếm

    //  Phân trang
    const pagination = await paginationHelper.productCategory(req, find);
    // Hết phân trang

    // Sắp xếp
    const sort = {};

    if(req.query.sortKey && req.query.sortValue){
      sort[req.query.sortKey] = req.query.sortValue;
    }
    else{
      sort.position = "asc";
    }
    // Hết Sắp xếp

    const records = await ProductCategory
    .find(find)
    .limit(pagination.limitItems)
    .skip(pagination.skip)
    .sort(sort);

    for(const item of records){
      // Người tạo
      if(item.createdBy){
        const accountCreated = await Account.findOne({
          _id: item.createdBy
        });
        item.createdByFullName = accountCreated.fullName;
      }
      else{
        item.createdByFullName = "";
      }
  
      item.createdAtFormat = moment(item.createdAt).format("DD/MM/YY HH:mm:ss");
    
      // Người cập nhật
      if(item.updatedBy) {
        const accountUpdated = await Account.findOne({
          _id: item.updatedBy
        });
        item.updatedByFullName = accountUpdated.fullName;
      } else {
        item.updatedByFullName = "";
      }
  
      item.updatedAtFormat = moment(item.updatedAt).format("DD/MM/YY HH:mm:ss");
      
      if(item.parent_id){
        const parentItem = await ProductCategory.findOne({
          _id: item.parent_id
        });

        item.title = item.title + ` (${parentItem.title})`;
      }
    }

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: records,
        filterStatus: filterStatus,
        keyword: keyword,
        pagination: pagination
    });
}

// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
    const categories = await ProductCategory.find({
        deleted: false
    });

    const newCategories = createTreeHelper(categories);

    res.render("admin/pages/products-category/create", {
        pageTitle: "Thêm mới danh mục sản phẩm",
        categories: newCategories
    });
}

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_create")) {
    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const countCagegory = await ProductCategory.countDocuments({});
      req.body.position = countCagegory + 1;
    }

    req.body.createdBy = res.locals.account.id;
  
    const newCategory = new ProductCategory(req.body);
    await newCategory.save();
  
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  }
  else{
    res.send(`403`);
  }
}

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await ProductCategory.findOne({
        _id: id,
        deleted: false
    });

    const categories = await ProductCategory.find({
        deleted: false
    });

    const newCategories = createTreeHelper(categories);

    res.render("admin/pages/products-category/edit", {
        pageTitle: "Chỉnh sửa danh mục sản phẩm",
        categories: newCategories,
        category: category
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
  }
}

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_edit")) {
    try {
      const id = req.params.id;
  
      if(req.body.position) {
        req.body.position = parseInt(req.body.position);
      } else {
        const countCagegory = await ProductCategory.countDocuments({});
        req.body.position = countCagegory + 1;
      }

      req.body.updatedBy = res.locals.account.id;
  
      await ProductCategory.updateOne({
          _id: id,
          deleted: false
      }, req.body);
      
      req.flash("success", "Cập nhật danh mục thành công");
  
    } catch (error) {
      req.flash("error", "ID không hợp lệ!");
    }
    res.redirect("back");
  }
  else{
    res.send(`403`);
  }
}

// [PATCH] /admin/products-category/delete/:id
module.exports.deletePatch = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_delete")) {
    const id = req.params.id;
  
    await ProductCategory.updateOne({
      _id: id
    },{
      deleted: true,
      deletedBy: res.locals.account.id
    });

    req.flash("success", "Xóa danh mục thành công!");

    res.json({
      code: 200
    });
  }
  else{
    res.send(`403`);
  }
}

// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
    try {
      const id = req.params.id;
  
      const category = await ProductCategory.findOne({
        _id: id,
        deleted: false
      });
  
      if(category) {
        if(category.parent_id != ''){
            const parentCategory = await ProductCategory.findOne({
                _id: category.parent_id,
                deleted: false
            });
            categoryParent = parentCategory.title;
        }
        else{
            categoryParent = "";
        }

        res.render("admin/pages/products-category/detail", {
          pageTitle: "Chi tiết danh mục sản phẩm",
          category: category,
          categoryParent: categoryParent
        });
      } else {
        res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
      }
    } catch (error) {
      res.redirect(`/${systemConfig.prefixAdmin}/products-category`);
    }
}

// [PATCH] /admin/products-category/change-status/:statusChange/:id
module.exports.changeStatus = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_edit")){
    const { id, statusChange } = req.params;

    await ProductCategory.updateOne({
      _id: id
    }, {
      status: statusChange
    });

    req.flash('success', 'Cập nhật trạng thái thành công!');

    res.json({
      code: 200
    });
  }
  else{
    res.send(`403`);
  }
}

// [PATCH] /admin/products-category/change-position/:id
module.exports.changePosition = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_edit")){
    const id = req.params.id;
    const position = req.body.position;

    await ProductCategory.updateOne({
      _id: id
    }, {
      position: position
    });

    res.json({
      code: 200
    });
  }
  else{
    res.send(`403`);
  }
}

// [PATCH] /admin/products-category/change-multi
module.exports.changeMulti = async (req, res) => {
  if(res.locals.role.permissions.includes("products-category_edit")){
    const { status, ids } = req.body;

    switch (status) {
      case "active":
      case "inactive":
        await ProductCategory.updateMany({
          _id: ids
        }, {
          status: status
        });
        break;
      case "delete":
        await Product.updateMany({
          _id: ids
        }, {
          deleted: true
        });
        break;
      default:
        break;
    }

    req.flash("success", "Cập nhật trạng thái thành công!");

    res.json({
      code: 200
    });
  }
  else{
    res.send(`403`);
  }
  
}