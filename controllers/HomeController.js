
const welcome = (req, res) => {
    res.json({
        success: true
    });
};

const upload = (req, res) => {
    res.json({
        success: true,
        message: `File uploaded successfully`,
        data: req.file
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
    upload,
    notFound
};
