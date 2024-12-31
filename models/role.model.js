const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  title: String,
  description: String,
  permissions: {
    type: Array,
    default: []
  },
  createdBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
}, {
  timestamps: true
});

const Role = mongoose.model("Role", roleSchema, "roles");

module.exports = Role;