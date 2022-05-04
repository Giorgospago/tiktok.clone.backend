
const welcome = (req, res) => {
    res.json({
        success: true
    });
};

const test = async (req, res) => {
    try {
        await download();
        res.json({
            success: true,
            message: "test"
        });
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        });
    }
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
    notFound,
    test
};
