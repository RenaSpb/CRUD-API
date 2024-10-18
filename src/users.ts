import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

const dataFilePath = path.join(__dirname, 'users.json');

// Функция для чтения пользователей из файла
const readUsersFromFile = (): User[] => {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data) as User[];
};

// Функция для записи пользователей в файл
const writeUsersToFile = (users: User[]): void => {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
};

// Загружаем пользователей из файла
const users: User[] = readUsersFromFile();

export function isValidUUID(uuid: string): boolean {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export const getAllUsers = (): User[] => users;

export const getUserById = (id: string): User | null => {
    const user = users.find(user => user.id === id);
    return user || null;
};

export const createUser = (userData: { username: string; age: number; hobbies: string[] }): User => {
    const newUser: User = {
        id: uuidv4(),
        ...userData
    };
    users.push(newUser);
    writeUsersToFile(users); // Записываем данные обратно в файл
    return newUser;
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
    if (!isValidUUID(id)) return null;
    const index = users.findIndex(user => user.id === id); // Исправлено: было = на ===
    if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        writeUsersToFile(users); // Записываем изменения в файл
        return users[index];
    }
    return null;
};

export const deleteUser = (id: string): boolean => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        writeUsersToFile(users); // Записываем изменения в файл
        return true;
    }
    return false;
};
