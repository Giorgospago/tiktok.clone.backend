const getAudio = async (req, res) => {
    const doc = await Audio
        .findById(req.params.audioId)
        .exec();

    res.json({
        success: true,
        data: doc,
        message: "Audio fetched"
    });
};


module.exports = {
    getAudio
};
