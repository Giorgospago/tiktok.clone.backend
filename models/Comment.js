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
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        text: {
            type: String,
            index: true
        },
        untold: [{
            type: String
        }]
    },
    {
        timestamps: true
    }
);

module.exports = model("Comment", schema);
