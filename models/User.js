const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        uid: {
            type: String
        },
        name: {
            type: String
        },
        username: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        photo: {
            type: String
        },
        password: {
            type: String
        },
        bio: {
            type: String
        },
        birthDate: {
            type: Date
        },
        country: {
            type: String,
            default: "Greece"
        },
        city: {
            type: String
        },
        gender: {
            type: String,
            enum : ['male', 'female'],
            default: 'male'
        },
        posts: [{
            type: Schema.Types.ObjectId,
            ref: "Post"
        }],
        followers: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        following: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        audioLikes: [{
            type: Schema.Types.ObjectId,
            ref: "Audio"
        }],
        deviceTokens: [String]
    },
    {
        timestamps: true
    }
);

module.exports = model("User", schema);
