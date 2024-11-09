import { Request, Response, NextFunction } from "express";
import { GenericDAO_TypeORM } from "../../daos/GenericDAO/GDAO_TypeORM";

export async function getUserIdFromUUID(req: Request & {userId:number}, res: Response, next: NextFunction) {
  const userTypeOrmDAO = new GenericDAO_TypeORM("users");

  const uid = req.headers['uid']; 

  if (Array.isArray(uid) || !uid) {
    return res.status(403).send("Uid is required and must be a single string");
  }

  const user = await userTypeOrmDAO.read({ filters: { uuid: uid } });
  if (!user) {
    return res.status(403).send("User not found");
  }

  if (!user.id) {
    return res.status(403).send("User id not found");
  }

  req.userId = user.id;

  next();
}
