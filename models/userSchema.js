const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    about: String,
    bio: String,
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    interests: [],
    avatar: {
        type: String,
        default: "dummy.png",
    },
    forgetPasswordToken: 0,
});

userSchema.plugin(plm, { usernameField: "email" });

const User = mongoose.model('User', userSchema);

module.exports = User;