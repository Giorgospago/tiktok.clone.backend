const {Types} = require('mongoose');
const bcrypt = require('bcryptjs');

global.bcryptHash = (str) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(str, salt);
};

global.bcryptCompare = (strA, strB) => {
    return bcrypt.compareSync(strA, strB);
};

global._ = (strId) => {
    return Types.ObjectId(strId);
};

