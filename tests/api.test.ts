import request from 'supertest';
import { server } from '../src/index';

describe('User API', () => {
    let createdUserId: string;

    afterAll((done) => {
        server.close(done);
    });

    it('should return an empty array of users initially', async () => {
        const response = await request(server).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should create a new user', async () => {
        const newUser = {
            username: 'Arya',
            age: 25,
            hobbies: ['sleeping', 'eating']
        };

        const response = await request(server)
            .post('/api/users')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(newUser);
        expect(response.body.id).toBeDefined();

        createdUserId = response.body.id;
    });

    it('should get the created user by id', async () => {
        const response = await request(server).get(`/api/users/${createdUserId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdUserId);
        expect(response.body.username).toBe('Arya');
    });

    it('should update user', async () => {
        const updatedUser = {
            username: 'Arya Stark',
            age: 26,
            hobbies: ['traveling']
        };
        const response = await request(server)
            .put(`/api/users/${createdUserId}`)
            .send(updatedUser);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updatedUser);
        expect(response.body.id).toBe(createdUserId);
    })

    it('should delete the user', async () => {
        const response = await request(server).delete(`/api/users/${createdUserId}`);
        expect(response.status).toBe(204);
    });

    it('should return 404 when trying to get the deleted user', async () => {
        const response = await request(server).get(`/api/users/${createdUserId}`);
        expect(response.status).toBe(404);
    });

});
