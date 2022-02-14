
const like = async (req, res) => {
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
};

const search = async (req, res) => {
    const limit = req.body.limit || 1;
    const seen = req.body.seen || [];

    let posts = await Post
        .find({
            _id: {$nin: seen},
            active: true,
        })
        .select({
            createdAt: 1,
            description: 1,
            scope:1,
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
        .exec();

    posts = posts.map(p => {
        p = p.toObject();

        p.liked = p.likes.some(l => l.user.toString() === req.user._id.toString());

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

module.exports = {
    like,
    search,
    create,
};
