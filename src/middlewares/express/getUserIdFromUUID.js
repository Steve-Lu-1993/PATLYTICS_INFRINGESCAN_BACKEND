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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromUUID = getUserIdFromUUID;
const GDAO_TypeORM_1 = require("../../daos/GenericDAO/GDAO_TypeORM");
function getUserIdFromUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userTypeOrmDAO = new GDAO_TypeORM_1.GenericDAO_TypeORM("users");
        const uid = req.headers['uid'];
        if (Array.isArray(uid) || !uid) {
            return res.status(403).send("Uid is required and must be a single string");
        }
        const user = yield userTypeOrmDAO.read({ filters: { uuid: uid } });
        if (!user) {
            return res.status(403).send("User not found");
        }
        if (!user.id) {
            return res.status(403).send("User id not found");
        }
        req.userId = user.id;
        next();
    });
}
