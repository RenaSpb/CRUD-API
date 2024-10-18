"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
exports.isValidUUID = isValidUUID;
const uuid_1 = require("uuid");
const users = [];
function isValidUUID(uuid) {
    return (0, uuid_1.validate)(uuid) && (0, uuid_1.version)(uuid) === 4;
}
const getAllUsers = () => users;
exports.getAllUsers = getAllUsers;
const getUserById = (id) => {
    const user = users.find(user => user.id === id);
    return user || null;
};
exports.getUserById = getUserById;
const createUser = (userData) => {
    const newUser = Object.assign({ id: (0, uuid_1.v4)() }, userData);
    users.push(newUser);
    return newUser;
};
exports.createUser = createUser;
const updateUser = (id, userData) => {
    if (!isValidUUID(id))
        return null;
    const index = users.findIndex(user => user.id = id);
    if (index != -1) {
        users[index] = Object.assign(Object.assign({}, users[index]), userData);
        return users[index];
    }
    return null;
};
exports.updateUser = updateUser;
const deleteUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        return true;
    }
    return false;
};
exports.deleteUser = deleteUser;
