import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    name: string;
    age: number;
    profession: string;
}

const users: User[] = [
    { id: uuidv4(), name: 'Jon Snow', age: 30, profession: 'Savior' },
    { id: uuidv4(), name: 'Arya Stark', age: 25, profession: 'Guard' },
];

// Функция для получения всех пользователей
export const getAllUsers = (): User[] => users;
