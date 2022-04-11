const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        firstPost: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        },
        meta: Schema.Types.Mixed
    },
    {
        timestamps: true
    }
);

module.exports = model("Audio", schema);
