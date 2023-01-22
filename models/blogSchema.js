const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    blog: Array,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;