const fs = require("fs");
const util = require("util");
const uuid = require("uuid");

const checkVideoNudity = async (videoUrl) => {
    try {
        console.log("Check Video Nudity for: ", videoUrl);
        const video = require('@google-cloud/video-intelligence').v1;

        // Creates a client
        const client = new video.VideoIntelligenceServiceClient();

        // Reads a local video file and converts it to base64
        const fileId = uuid.v4();
        const localFile = `temp/${fileId}.mp4`;
        await download(videoUrl, localFile);
        const readFile = util.promisify(fs.readFile);
        const file = await readFile(localFile);
        const inputContent = file.toString('base64');

        // Constructs request
        const request = {
            inputContent: inputContent,
            features: ['EXPLICIT_CONTENT_DETECTION'],
        };

        const likelihoods = [
            'UNKNOWN',
            'VERY_UNLIKELY',
            'UNLIKELY',
            'POSSIBLE',
            'LIKELY',
            'VERY_LIKELY',
        ];

        const nudity = [];

        // Detects labels in a video
        const [operation] = await client.annotateVideo(request);
        const [operationResult] = await operation.promise();

        // Gets unsafe content
        const explicitContentResults = operationResult.annotationResults[0].explicitAnnotation;
        explicitContentResults.frames.forEach(result => {
            if (result.timeOffset === undefined) {
                result.timeOffset = {};
            }
            if (result.timeOffset.seconds === undefined) {
                result.timeOffset.seconds = 0;
            }
            if (result.timeOffset.nanos === undefined) {
                result.timeOffset.nanos = 0;
            }

            const timestamp = parseFloat(result.timeOffset.seconds + '.' + (result.timeOffset.nanos / 1e6).toFixed(0));
            nudity.push({
                timestamp: timestamp,
                value: likelihoods[result.pornographyLikelihood]
            });
        });

        return nudity;
    } catch (e) {
        console.log(e.message);
        return [];
    }
};

module.exports = {
    checkVideoNudity
};
