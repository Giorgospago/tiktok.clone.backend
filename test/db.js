const lib = {
    connect: async () => {
        const uri = "mongodb://......../db";
        console.log("Connecting to database...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        lib.onConnect(uri);
        return true;
    },
    onConnect: (uri) => {}
};

module.exports = lib;