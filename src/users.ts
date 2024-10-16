import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

const users: User[] = [
    { id: uuidv4(), username: 'Jon Snow', age: 30, hobbies: ['sword fighting', 'brooding'] },
    { id: uuidv4(), username: 'Arya Stark', age: 25, hobbies: ['assassinating', 'traveling'] },
    { id: uuidv4(), username: 'Daenerys Targaryen', age: 28, hobbies: ['dragon riding', 'conquering'] },
];

export const getAllUsers = (): User[] => users;

export const getUserById = (id: string): User | null => {
    const user = users.find(user => user.id === id);
    return user || null;
};

