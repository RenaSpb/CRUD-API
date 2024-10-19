import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

const dataFilePath: string = path.join(__dirname, 'db.json');

export const readUsersFromFile = (): User[] => {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(data) as User[];
    } catch (error) {
        return [];
    }
};

export const writeUsersToFile = (users: User[]): void => {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};

export function isValidUUID(uuid: string): boolean {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export const getAllUsers = (): User[] => {
    return readUsersFromFile();
};

export const getUserById = (id: string): User | null => {
    const users = readUsersFromFile();
    return users.find(user => user.id === id) || null;
};

export const createUser = (userData: { username: string; age: number; hobbies: string[] }): User => {
    const users = readUsersFromFile();
    const newUser: User = {
        id: uuidv4(),
        ...userData
    };
    users.push(newUser);
    writeUsersToFile(users);
    return newUser;
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
    if (!isValidUUID(id)) return null;
    const users = readUsersFromFile();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        writeUsersToFile(users);
        return users[index];
    }
    return null;
};

export const deleteUser = (id: string): boolean => {
    const users = readUsersFromFile();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        writeUsersToFile(users);
        return true;
    }
    return false;
};
