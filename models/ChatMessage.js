const {Schema, model} = require("mongoose");

const mediaSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["photo", "video", "audio", "link"]
        },
        url: String
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false
    }
);

const schema = new Schema(
    {
        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat"
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        message: {
            type: String
        },
        media: [mediaSchema],
        read: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        untold: [{
            type: String
        }]
    },
    {
        timestamps: true
    }
);

module.exports = model("ChatMessage", schema);
