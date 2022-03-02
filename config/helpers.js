const {Types} = require('mongoose');
const bcrypt = require('bcryptjs');
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

