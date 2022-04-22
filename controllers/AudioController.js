const getAudio = async (req, res) => {
    try {
        const doc = await Audio
            .findById(req.params.audioId)
            .exec();

        res.json({
            success: true,
            data: doc,
            message: "Audio fetched"
        });
    } catch (e) {
        console.log(e);
    }

};


module.exports = {
    getAudio
};
