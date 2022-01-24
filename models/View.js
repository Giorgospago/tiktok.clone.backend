const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        enteredAt: {
            type: Date
        },
        leftAt: {
            type: Date
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: false
    }
);

module.exports = model("View", schema);
