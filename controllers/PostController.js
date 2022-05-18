const admin = require("firebase-admin");

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

// const searchOld = async (req, res) => {
//     const limit = req.body.limit || 1;
//     const seen = req.body.seen || [];
//     const ids = req.body.ids || [];
//     const me = await User.findById(req.user._id).exec();
//
//     const filters = {
//         active: true
//     };
//
//     if (ids.length) {
//         filters._id = {$in: ids};
//     } else {
//         filters.user = {$ne: me._id};
//
//         if (seen.length) {
//             filters._id = {$nin: seen};
//         }
//     }
//
//     let posts = await Post
//         .find(filters)
//         .select({
//             createdAt: 1,
//             description: 1,
//             scope: 1,
//             tags: 1,
//             videoUrl: 1,
//             likes: 1,
//             shares: 1,
//             comments: 1
//         })
//         .populate([
//             {
//                 path: "user",
//                 select: {
//                     name: 1,
//                     photo: 1
//                 }
//             },
//             {path: "likes"}
//         ])
//         .limit(limit)
//         .sort({
//             updatedAt: -1
//         })
//         .exec();
//
//     posts = posts.map(p => {
//         p = p.toObject();
//
//         const myFollowing = me.following.map(f => f.toString());
//         p.user.following = myFollowing.includes(p.user._id.toString()) || (me.id === p.user._id.toString());
//         p.liked = p.likes.some(l => l.user.toString() === me._id.toString());
//
//         p.likes = p.likes.length;
//         p.shares = p.shares.length;
//         p.comments = p.comments.length;
//         return p;
//     });
//
//     res.json({
//         success: true,
//         message: "Posts fetched successfully",
//         data: posts
//     });
// };

const esSync = async (req, res) => {
    await Post.esTruncate();
    await Post.synchronize();

    res.json({
        success: true,
        message: "Posts are synced"
    });
};

const elastic = async (req, res) => {
    const result = await Post.search(
        undefined,
        {hydrate: true}
    );
    const posts = result.body.hits.hydrated;

    res.json({
        success: true,
        message: "Posts fetched",
        data: posts
    });
};

const search = async (req, res) => {
    const limit = req.body.limit || 1;
    const seen = req.body.seen || [];
    const ids = req.body.ids || [];
    const audios = req.body.audios || [];
    const me = await User.findById(req.user._id).exec();

    const pipeline = [];

    /**
     * Generate Match filters
     */
    const filters = {
        active: true
    };

    if (audios.length) {
        filters.audio = {$in: audios.map(ObjectId)};
    }
    else if (ids.length) {
        filters._id = {$in: ids.map(ObjectId)};
    } else {
        filters.user = {$ne: me._id};

        if (seen.length) {
            filters._id = {$nin: seen.map(ObjectId)};
        }
    }

    pipeline.push({$match: filters});


    /**
     * Lookups
     */
    pipeline.push(...[
        {
            $lookup: {
                from: "views",
                localField: "_id",
                foreignField: "post",
                pipeline: [
                    {
                        $count: "total"
                    }
                ],
                as: "views"
            }
        },
        {
            $set: {
                views: {$arrayElemAt: ["$views", 0]}
            }
        },
        {
            $set: {
                views: "$views.total"
            }
        }
    ]);


    /**
     * Project documents
     */
    const projection = {
        createdAt: 1,
        updatedAt: 1,
        description: 1,
        scope: 1,
        audio: 1,
        tags: 1,
        videoUrl: 1,
        videoVolume: 1,
        thumbnailUrl: 1,
        likes: 1,
        shares: 1,
        user: 1,
        comments: 1,
        views: 1,
        nudity: 1,
        sortValue: 1
    };
    pipeline.push({$project: projection});

    /**
     * Sort data
     */
    pipeline.push({
        $sort: {
            sortValue: -1
        }
    });

    /**
     * Limit data
     */
    pipeline.push({$limit: limit});

    const docs = await Post.aggregate(pipeline);
    let posts = await Post.populate(docs, {
        path: "user",
        select: {
            name: 1,
            photo: 1
        }
    });
    posts = await Post.populate(posts, {
        path: "likes"
    });
    posts = await Post.populate(posts, {
        path: "audio"
    });

    posts = posts.map(p => {
        p = defrost(p);

        const myFollowing = me.following.map(f => f.toString());
        p.user.following = myFollowing.includes(p.user._id.toString()) || (me.id === p.user._id.toString());
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
    const videoInfo = await downloadVideoAndGetInfo(req.body.videoUrl, !!req.body.audio);
    const postData = {
        ...req.body,
        duration: isNaN(videoInfo.duration) ? null : videoInfo.duration,
        user: user._id
    };
    const post = new Post(postData);
    await post.save();

    if (videoInfo.audio && videoInfo.audio.url) {
        const audio = new Audio({
            url: videoInfo.audio.url,
            name: `${videoInfo.audio.meta.artist} - ${videoInfo.audio.meta.title} (${videoInfo.audio.meta.album})`,
            firstPost: post._id,
            meta: videoInfo.audio.meta
        });
        await audio.save();

        post.audio = audio._id;
        await post.save();
    }

    if (!Array.isArray(user.posts)) {
        user.posts = [];
    }
    user.posts.push(post._id);
    await user.save();

    post.nudity = await MLController.checkVideoNudity(post.videoUrl);
    await post.save();

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
                thumbnailUrl: 1,
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
            .populate([
                {
                    path: "post",
                    select: {
                        videoUrl: 1
                    }
                }
            ])
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

const viewCalculation = async () => {
    try {
        const viewsMultiplier = parseFloat(await redis.get('multiplier:views'));
        const dtMultiplier = parseFloat(await redis.get('multiplier:dt'));
        const likesMultiplier = parseFloat(await redis.get('multiplier:likes'));
        const commentsMultiplier = parseFloat(await redis.get('multiplier:comments'));

        await View.aggregate([
            // {
            //     $limit: 1
            // },
            {
                $set: {
                    duration: {
                        $dateDiff: {
                            startDate: "$enteredAt",
                            endDate: "$leftAt",
                            unit: "millisecond"
                        }
                    }
                }
            },
            /** Per post
             *********************
             * sum of duration
             * avg of duration
             * total views
             * total users
             **********************
             */
            {
                $group: {
                    _id: "$post",
                    sumOfDuration: {$sum: "$duration"},
                    avgOfDuration: {$avg: "$duration"},
                    totalViews: {$sum: 1},
                    totalUsers: {$addToSet: "$user"}
                }
            },

            // method 1
            // {
            //     $set: {
            //         post: "$_id",
            //         totalUsers: {$size: "$totalUsers"}
            //     }
            // },
            // {
            //     $unset: ["_id"]
            // }

            // method 2
            {
                $project: {
                    sumOfDuration: 1,
                    avgOfDuration: {$round: "$avgOfDuration"},
                    totalViews: 1,
                    totalUsers: {$size: "$totalUsers"},
                    // post: "$_id",
                    // _id: 0
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "post",
                    foreignField: "post",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $ne: [{$mod: ["$pressed", 2]}, 0]
                                }
                            }
                        },
                        {
                            $count: "totalLikes"
                        }
                    ],
                    as: "likes"
                }
            },

            // Method 1
            // {
            //     $set: {
            //         likes: {$arrayElemAt: ["$likes", 0]}
            //     }
            // },
            // {
            //     $set: {
            //         likes: {$ifNull: ["$likes.totalLikes", 0]}
            //     }
            // },

            // Method 2
            {
                $set: {
                    likes: {
                        $ifNull: [
                            {
                                $let: {
                                    vars: {
                                        myObj: {$arrayElemAt: ["$likes", 0]}
                                    },
                                    in: "$$myObj.totalLikes"
                                }
                            },
                            0
                        ]
                    }
                }
            },

            {
                $project: {
                    _id: 1,
                    stats: {
                        sumOfDuration: "$sumOfDuration",
                        avgOfDuration: "$avgOfDuration",
                        totalViews: "$totalViews",
                        totalUsers: "$totalUsers"
                    }
                }
            },

            {
                $merge: {
                    into: "posts",
                    on: "_id",
                    whenMatched: "merge",
                    whenNotMatched: "discard"
                }
            }
        ]);

        await Post.aggregate([
            {
                $project: {
                    _id: 1,
                    comments: {$size: "$comments"},
                    likes: {$size: "$likes"},
                    stats: 1,
                    dt: {$divide: [{$divide: ["$stats.avgOfDuration", 1000]}, "$duration"]}
                }
            },
            {
                $project: {
                    sortValue: {
                        $sum: [
                            {$multiply: ["$stats.totalViews", viewsMultiplier]},
                            {$multiply: ["$dt", dtMultiplier]},
                            {$multiply: ["$likes", likesMultiplier]},
                            {$multiply: ["$comments", commentsMultiplier]}
                        ]
                    }
                }
            },
            {
                $merge: {
                    into: "posts",
                    on: "_id",
                    whenMatched: "merge",
                    whenNotMatched: "discard"
                }
            }
        ]);
    } catch (e) {
        console.log(e.message)
    }
};

const calculateVideoDuration = async (req, res) => {
    const posts = await Post
        .find({duration: {$exists: false}})
        .select("videoUrl")
        .exec();

    for (let post of posts) {
        const videoInfo = await downloadVideoAndGetInfo(post.videoUrl);
        post.duration = videoInfo.duration;
        await post.save();
    }

    res.json({
        success: true,
        data: posts,
        message: "Duration calculated"
    });
};

const share = async (req, res) => {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(req.body.receiver);
    const post = await Post.findById(req.body.post);
    const messageText = req.body.message || "Only for you!";

    const share = new Share({sender, receiver, post});
    await share.save();

    if (!Array.isArray(post.shares)) {
        post.shares = [];
    }

    post.shares.push(share._id);
    await post.save();

    // Send message
    const chat = await Chat.findOne({
        $and: [
            {
                users: {$elemMatch: {$eq: sender._id}}
            },
            {
                users: {$elemMatch: {$eq: receiver._id}}
            },
            {
                "users.2": {$exists: false}
            }
        ]
    });
    if (chat) {
        const message = new ChatMessage({
            chat: chat._id,
            sender: sender._id,
            message: messageText,
            media: [
                {
                    type: "video",
                    url: post.videoUrl
                }
            ]
        });
        await message.save();
        io.emit(`chat:receive-message:${chat.id}`, message);
    }

    // Send push notification
    for (let t of receiver.deviceTokens) {
        if (t.trim()) {
            admin.messaging().send({
                notification: {
                    title: sender.name,
                    body: messageText,
                    imageUrl: post.thumbnailUrl
                },
                token: t
            });
        }
    }

    res.json({
        success: true,
        message: "Share saved"
    });
};


module.exports = {
    like,
    search,
    create,
    getComments,
    addComment,
    textSearch,
    storeNewView,
    viewCalculation,
    calculateVideoDuration,
    share,
    elastic,
    esSync
};
