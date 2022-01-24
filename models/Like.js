const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        pressed: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = model("Like", schema);
