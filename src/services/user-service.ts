import { User } from "../models/user";
import jwt, {JwtPayload} from 'jsonwebtoken';

export class UserService {
    private lastId: number = 0;
    private users: User[];
    private secret: string = "lab3";

    constructor() {
        this.users = [];
        this.addUser("admin@email.com", "admin")
    }

    addUser(email: string, password: string) {
        this.lastId++;

        var user = new User(this.lastId, email, password);
        this.users.push(user);
    }

    login(email: string, password: string) {
        var index = this.users.findIndex(u => u.email == email && u.password == password)

        if (index !== -1)
            return jwt.sign({email}, this.secret);
    }

    isTokenValid(token: string) {
        let verifiedToken = jwt.verify(token, this.secret);

        if (verifiedToken) {
            return true;
        }

        return false;
    }
}