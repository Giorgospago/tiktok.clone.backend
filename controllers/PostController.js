const like = async (req, res) => {
    // TODO zartas
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.json({
                success: false,
                message: "Post not found"
            });
        }

        let postLike = await Like.findOneAndUpdate(
            {
                post: postId,
                user: userId
            },
            {
                $inc: {
                    pressed: 1
                }
            },
            {
                new: true,
                upsert: true
            }
        ).exec();

        if (postLike.liked) {
            post.likes.push(postLike._id);
        } else {
            post.likes = post.likes
                .filter(id => id.toString() !== postLike._id.toString());
        }
        await post.save();

        res.json({
            success: true,
            message: "Posts liked successfully",
            data: {
                liked: postLike.liked,
                likes: post.likes.length
            }
        });
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        });
    }
};

const search = async (req, res) => {
    const limit = req.body.limit || 1;
    const seen = req.body.seen || [];
    const ids = req.body.ids || [];
    const me = await User.findById(req.user._id).exec();

    const filters = {
        active: true
    };

    if (ids.length) {
        filters._id = {$in: ids};
    } else if (seen.length) {
        filters._id = {$nin: seen};
        filters.user = {$ne: me._id}
    }

    let posts = await Post
        .find(filters)
        .select({
            createdAt: 1,
            description: 1,
            scope: 1,
            tags: 1,
            videoUrl: 1,
            likes: 1,
            shares: 1,
            comments: 1
        })
        .populate([
            {
                path: "user",
                select: {
                    name: 1,
                    photo: 1
                }
            },
            {path: "likes"}
        ])
        .limit(limit)
        .sort({
            updatedAt: -1
        })
        .exec();

    posts = posts.map(p => {
        p = p.toObject();

        const myFollowing = me.following.map(f => f.toString());
        p.user.following = myFollowing.includes(p.user._id.toString());
        p.liked = p.likes.some(l => l.user.toString() === me._id.toString());

        p.likes = p.likes.length;
        p.shares = p.shares.length;
        p.comments = p.comments.length;
        return p;
    });

    res.json({
        success: true,
        message: "Posts fetched successfully",
        data: posts
    });
};

const create = async (req, res) => {
    const user = await User.findById(req.user._id).exec();

    const postData = {
        ...req.body,
        user: user._id
    };
    const post = new Post(postData);
    await post.save();

    if (!Array.isArray(user.posts)) {
        user.posts = [];
    }
    user.posts.push(post._id);
    await user.save();

    res.json({
        success: true,
        message: "Your post just created"
    });
};

const getComments = async (req, res) => {
    // const comments = await Comment
    //     .find({
    //         post: req.params.id
    //     })
    //     .populate({
    //         path: "user"
    //     })
    //     .sort({
    //         createdAt: -1
    //     })
    //     .exec();

    const comments = await Comment.aggregate([
        {
            $match: {
                post: ObjectId(req.params.id),
                comment: {$exists: false}
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
        message: "Post comments"
    });
};

const addComment = async (req, res) => {
    const post = await Post.findById(req.body.post).exec();
    const doc = new Comment({
        ...req.body,
        user: req.user._id
    });
    await doc.save();

    post.comments.push(doc._id);
    await post.save();

    res.json({
        success: true,
        data: doc,
        message: "Comment created"
    });
};

const storeNewView = async (req, res) => {
    const doc = await View({
        enteredAt: req.body.enteredAt,
        leftAt: req.body.leftAt,
        post: req.body.post,
        user: req.user._id
    });
    await doc.save();
    res.json({
        success: true,
        message: "View added successfully"
    });
};

const textSearch = async (req, res) => {

    const reg = {$regex: req.body.key, $options: 'gi'};
    const promises = [
        Post
            .find({
                description: reg
            })
            .select({
                createdAt: 1,
                description: 1,
                scope: 1,
                tags: 1,
                videoUrl: 1,
                likes: 1,
                shares: 1,
                comments: 1
            })
            .populate([
                {
                    path: "user",
                    select: {
                        name: 1,
                        photo: 1
                    }
                },
                {path: "likes"}
            ])
            .sort({
                updatedAt: -1
            })
            .exec(),
        User
            .find({
                $or: [
                    {name: reg},
                    {gender: reg},
                    {username: reg}
                ]
            })
            .exec(),
        Comment
            .find({
                text: reg
            })
            .exec()
    ];

    const [posts, users, comments] = await Promise.all(promises);

    res.json({
        success: true,
        data: {
            posts,
            users,
            comments
        },
        message: "Search results"
    });
};

module.exports = {
    like,
    search,
    create,
    getComments,
    addComment,
    textSearch,
    storeNewView
};
