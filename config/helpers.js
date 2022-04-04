const https = require('https');
const fs = require('fs');
const {Types} = require('mongoose');
const bcrypt = require('bcryptjs');
const uuid = require("uuid");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");

global._ = require('lodash');

global.bcryptHash = (str) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(str, salt);
};

global.bcryptCompare = (strA, strB) => {
    return bcrypt.compareSync(strA, strB);
};

global.ObjectId = (strId) => {
    return Types.ObjectId(strId);
};

global.defrost = (val) => {
    return JSON.parse(JSON.stringify(val));
};

global.download = (url, dest) => {
    return new Promise(resolve => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
        });
    });
};

global.downloadVideoAndGetInfo = async (videoUrl) => {
    const localFile = `temp/${uuid.v4()}.mp4`;
    await download(videoUrl, localFile);

    const info = await ffprobe(localFile, {path: ffprobeStatic.path});
    fs.rm(localFile, () => {});

    if (!(info && info.streams && info.streams.length)) {
        console.log("Unable to decode file");
        return {};
    }

    const videoInfo = info.streams.find(s => s.codec_type === "video");
    const audioInfo = info.streams.find(s => s.codec_type === "audio");

    return {
        duration: parseFloat(videoInfo.duration)
    };
};