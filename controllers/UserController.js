const me = async (req, res) => {
    const user = await User
        .findById(req.user._id)
        .populate([
            {
                path: "posts",
                options: {
                    sort: "-createdAt"
                }
            }
        ])
        .exec();

    res.json({
        success: true,
        data: user,
        message: "Your post just created"
    });
};
const follow = async (req, res) => {
    const loggedIn = await User.findById(req.user._id).exec();
    const toFollow = await User.findById(req.params.id).exec();

    if (!toFollow) {
        return res.json({
            success: false,
            message: "User not found"
        });
    }

    const strFollowers = toFollow.followers.map(f => f.toString());
    if (strFollowers.includes(loggedIn._id.toString())) {
        return res.json({
            success: false,
            message: "You already following this user"
        });
    }

    toFollow.followers.push(loggedIn._id);
    loggedIn.following.push(toFollow._id);

    await toFollow.save();
    await loggedIn.save();

    res.json({
        success: true,
        message: "You are following " + toFollow.name
    });
};

const userProfile = async (req, res) => {
    const postUserId = req.params.id;
    const user = await User
        .findById(postUserId)
        .populate([
            {
                path: "posts",
                options: {
                    sort: "-createdAt"
                }
            }
        ])
        .exec();

    if (!user) {
        res.json({
            success: false,
            message: "user not found"
        })
    }

    res.json({
        success: true,
        message: "user fetched successfully",
        data: user
    })
};

const following = async (req, res) => {
    const user = await User
        .findById(req.user._id)
        .select({
            following: 1
        })
        .exec();
        
    const userFollowing = await User
        .findById(user.following)
        .exec();

    res.json({
        success: true,
        message: "following users fetched successfully",
        data: userFollowing
    })
};

module.exports = {
    me,
    follow,
    userProfile,
    following
};
