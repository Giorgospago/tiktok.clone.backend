const pug = require("pug");

global.renderPug = (template, data) => {
    return pug.compileFile(template)(data);
};
