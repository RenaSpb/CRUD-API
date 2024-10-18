"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.writeUsersToFile = exports.readUsersFromFile = void 0;
exports.isValidUUID = isValidUUID;
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataFilePath = path_1.default.join(__dirname, 'db.json');
const readUsersFromFile = () => {
    if (!fs_1.default.existsSync(dataFilePath)) {
        return [];
    }
    const data = fs_1.default.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return [];
    }
};
exports.readUsersFromFile = readUsersFromFile;
const writeUsersToFile = (users) => {
    fs_1.default.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};
exports.writeUsersToFile = writeUsersToFile;
function isValidUUID(uuid) {
    return (0, uuid_1.validate)(uuid) && (0, uuid_1.version)(uuid) === 4;
}
const getAllUsers = () => {
    return (0, exports.readUsersFromFile)();
};
exports.getAllUsers = getAllUsers;
const getUserById = (id) => {
    const users = (0, exports.readUsersFromFile)();
    return users.find(user => user.id === id) || null;
};
exports.getUserById = getUserById;
const createUser = (userData) => {
    const users = (0, exports.readUsersFromFile)();
    const newUser = Object.assign({ id: (0, uuid_1.v4)() }, userData);
    users.push(newUser);
    (0, exports.writeUsersToFile)(users);
    return newUser;
};
exports.createUser = createUser;
const updateUser = (id, userData) => {
    if (!isValidUUID(id))
        return null;
    const users = (0, exports.readUsersFromFile)();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users[index] = Object.assign(Object.assign({}, users[index]), userData);
        (0, exports.writeUsersToFile)(users);
        return users[index];
    }
    return null;
};
exports.updateUser = updateUser;
const deleteUser = (id) => {
    const users = (0, exports.readUsersFromFile)();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        (0, exports.writeUsersToFile)(users);
        return true;
    }
    return false;
};
exports.deleteUser = deleteUser;
