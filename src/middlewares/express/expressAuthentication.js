"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function expressAuthentication(request, securityName, scopes) {
    const authToken = request.headers.authorization;
    return new Promise((resolve, reject) => {
        if (!authToken) {
            return reject(new Error("No token provided."));
        }
        if (!authToken.startsWith("Bearer ")) {
            return reject(new Error("Invalid token format. Expected 'Bearer <token>'."));
        }
        const token = authToken.slice(7);
        const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
        jsonwebtoken_1.default.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return reject(new Error("Failed to authenticate token."));
            }
            // If the token is valid, you can add the decoded information to the request object
            // for use in subsequent middleware or route handlers
            request.user = decoded;
            resolve(decoded);
        });
    });
}
