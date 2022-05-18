global.mongoosastic = require("mongoosastic");
global.mongoosasticOptions = {
    clientOptions: {
        nodes: (process.env.ELASTIC_HOSTS || "").split(',')
    }
};
