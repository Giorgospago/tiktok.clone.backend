const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        videoUrl: {
            type: String,
            required: true
        },
        videoVolume: {
            type: Number,
            default: 1
        },
        audio: {
            type: Schema.Types.ObjectId,
            ref: "Audio"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tags: [{
            type: String
        }],
        description: {
            type: String
        },
        active: {
            type: Boolean,
            default: true
        },
        scope: {
            type: String,
            enum: ["private", "friends", "public"],
            default: "public"
        },
        stats: {
            type: Schema.Types.Mixed
        },
        comments: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }],
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "Like"
        }],
        views: [{
            type: Schema.Types.ObjectId,
            ref: "View"
        }],
        shares: [{
            type: Schema.Types.ObjectId,
            ref: "Share"
        }],
        screenshots: [{
            type: Schema.Types.ObjectId,
            ref: "Screenshot"
        }]
    },
    {
        timestamps: true
    }
);

module.exports = model("Post", schema);
