const { streamUpload } = require("../../helpers/streamUpload.helper");

module.exports.uploadSingle = async (req, res, next) => {
  if (req.file) {
    const uploadToCloudinary = async (buffer) => {
        const result = await streamUpload(buffer);
        req.body[req.file.fieldname] = result.url;
        next();
    }
    uploadToCloudinary(req.file.buffer);
} else {
    next();
}
}

module.exports.uploadFields = async (req, res, next) => {
  try {
    for (const key in req.files) {
        req.body[key] = [];

        const array = req.files[key];
        for (const item of array) {
            const result = await streamUpload(item.buffer);
            req.body[key].push(result.url);
        }
    }

    next();
} catch (error) {
    console.log(error);
}
}