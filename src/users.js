"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const uuid_1 = require("uuid");
const users = [
    { id: (0, uuid_1.v4)(), name: 'Jon Snow', age: 30, profession: 'Savior' },
    { id: (0, uuid_1.v4)(), name: 'Arya Stark', age: 25, profession: 'Guard' },
];
// Функция для получения всех пользователей
const getAllUsers = () => users;
exports.getAllUsers = getAllUsers;
