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

module.exports = {
    me,
};
