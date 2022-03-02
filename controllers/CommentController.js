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
