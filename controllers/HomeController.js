
const welcome = (req, res) => {
    res.json({
        success: true
    });
};

const testPosts = (req, res) => {
    res.json({
        success: true,
        message: `No posts found`,
        data: req.user.name
    });
};

const notFound = (req, res) => {
    res.json({
        success: false,
        message: `Page: ${req.url} not found`
    });
};

module.exports = {
    welcome,
    testPosts,
    notFound
};
