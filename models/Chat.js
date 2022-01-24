const {Schema, model} = require("mongoose");

const schema = new Schema(
    {
        users: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        inactiveUsers: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        name: {
            type: String
        },
        theme: {
            type: String
        },
        photo: {
            type: String
        },
        mute: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
);

module.exports = model("Chat", schema);
