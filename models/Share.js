const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

module.exports = model("Share", schema);
