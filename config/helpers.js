const https = require('https');
const axios = require('axios');
const fs = require('fs');
const {Types} = require('mongoose');
const bcrypt = require('bcryptjs');
const uuid = require("uuid");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const extractAudio = require('ffmpeg-extract-audio');

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

global.downloadVideoAndGetInfo = async (videoUrl, audioExists) => {
    const fileId = uuid.v4();
    const localFile = `temp/${fileId}.mp4`;
    const localAudioFile = `temp/${fileId}.mp3`;
    await download(videoUrl, localFile);

    const info = await ffprobe(localFile, {path: ffprobeStatic.path});
    if (!(info && info.streams && info.streams.length)) {
        console.log("Unable to decode file");
        return {};
    }
    const videoInfo = info.streams.find(s => s.codec_type === "video");

    if (audioExists) {
        fs.rm(localFile, () => {});
        return {
            duration: parseFloat(videoInfo.duration)
        };
    }

    await extractAudio({
        input: localFile,
        output: localAudioFile
    });

    const uploadData = await new Promise(resolve => {
        s3.upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${fileId}.mp3`,
            Body: fs.readFileSync(localAudioFile),
            ACL: process.env.AWS_S3_ACL
        }, (err, data) => {
            if (err) {
                resolve(null);
            }
            resolve(data);
        });
    });

    let songMeta = {};
    if (uploadData.Location) {
        try {
            const response = await axios.request({
                method: 'POST',
                url: 'https://api.audd.io/',
                data: {
                    url: uploadData.Location,
                    return: "lyrics,apple_music,spotify",
                    api_token: process.env.AUDD_IO_API_KEY
                }
            });
            if (response.data && response.data.status === "success") {
                songMeta = response.data.result;
            }
        } catch (e) {}
    }

    fs.rm(localFile, () => {});
    fs.rm(localAudioFile, () => {});

    return {
        duration: parseFloat(videoInfo.duration),
        audio: {
            url: uploadData.Location || "",
            meta: songMeta
        }
    };
};