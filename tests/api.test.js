"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const src_1 = require("../src");
describe('User API', () => {
    let createdUserId;
    afterAll((done) => {
        src_1.server.close(done);
    });
    it('should return an empty array of users initially', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(src_1.server).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }));
    it('should create a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            username: 'Arya',
            age: 25,
            hobbies: ['sleeping', 'eating']
        };
        const response = yield (0, supertest_1.default)(src_1.server)
            .post('/api/users')
            .send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(newUser);
        expect(response.body.id).toBeDefined();
        createdUserId = response.body.id;
    }));
    it('should get the created user by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(src_1.server).get(`/api/users/${createdUserId}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdUserId);
        expect(response.body.username).toBe('Arya');
    }));
    it('should update user', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedUser = {
            username: 'Arya Stark',
            age: 26,
            hobbies: ['traveling']
        };
        const response = yield (0, supertest_1.default)(src_1.server)
            .put(`/api/users/${createdUserId}`)
            .send(updatedUser);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updatedUser);
        expect(response.body.id).toBe(createdUserId);
    }));
    it('should delete the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(src_1.server).delete(`/api/users/${createdUserId}`);
        expect(response.status).toBe(204);
    }));
    it('should return 404 when trying to get the deleted user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(src_1.server).get(`/api/users/${createdUserId}`);
        expect(response.status).toBe(404);
    }));
});
