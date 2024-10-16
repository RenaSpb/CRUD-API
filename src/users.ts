import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

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

export function isValidUUID(uuid: string): boolean {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export const getAllUsers = (): User[] => users;

export const getUserById = (id: string): User | null => {
    const user = users.find(user => user.id === id);
    return user || null;
};

export const createUser = (userData: { username: string; age: number; hobbies: string[] }): User => {
    console.log('Creating user with data:', userData);
    const newUser: User = {
        id: uuidv4(),
        ...userData
    };
    users.push(newUser);
    return newUser;
};

export const updateUser = (id: string, userData: Partial<User>): User | null => {
    if (!isValidUUID(id)) return null;
    const index = users.findIndex(user => user.id = id);
    if (index!= -1) {
        users[index] = {...users[index], ...userData};
        return users[index];
    }
    return null
}
