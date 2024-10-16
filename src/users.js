"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getAllUsers = void 0;
const uuid_1 = require("uuid");
const users = [
    { id: (0, uuid_1.v4)(), username: 'Jon Snow', age: 30, hobbies: ['sword fighting', 'brooding'] },
    { id: (0, uuid_1.v4)(), username: 'Arya Stark', age: 25, hobbies: ['assassinating', 'traveling'] },
    { id: (0, uuid_1.v4)(), username: 'Daenerys Targaryen', age: 28, hobbies: ['dragon riding', 'conquering'] },
];
const getAllUsers = () => users;
exports.getAllUsers = getAllUsers;
const getUserById = (userId) => {
    return users.find(user => user.id === userId);
};
exports.getUserById = getUserById;
