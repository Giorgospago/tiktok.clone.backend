
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
    create,
};
