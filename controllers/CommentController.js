const getReplies = async (req, res) => {
    const comments = await Comment.aggregate([
        {
            $match: {
                comment: ObjectId(req.params.id)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $graphLookup: {
                from: "comments",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "comment",
                maxDepth: 0,
                as: "replies"
            }
        },
        {
            $set: {
                replies: {$size: "$replies"}
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $set: {
                user: {
                    $arrayElemAt: ["$user", 0]
                }
            }
        },
        {
            $project: {
                replies: 1,
                text: 1,
                "user._id": 1,
                "user.name": 1,
                "user.photo": 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    res.json({
        success: true,
        data: comments,
        message: "Comments fetched"
    });
};

module.exports = {
    getReplies
};
