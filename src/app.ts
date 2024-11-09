import express, { json, urlencoded } from "express";
import morgan from "morgan";
import swaggerJson from "../build/swagger.json";
import swaggerUI from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import "reflect-metadata";
import { RegisterRoutes } from "../build/routes";
import { AppDataSource } from "./configs/TypeORM";
import { initializeTypeORMDatabase } from "./utilis/initDatabase";


require("dotenv").config();

const { NODE_ENV,PORT, BASE_PATH,FRONTEND_BASE_URL,JWT_SECRET,REFRESH_TOKEN_SECRET,RATE_LIMIT,TRUST_PROXY } = process.env;
console.log("NODE_ENV:", NODE_ENV);
console.log(`USING_JWT_SECRET:${JWT_SECRET}`);
console.log(`USING_REFRESH_TOKEN:${REFRESH_TOKEN_SECRET}`)
console.log(`SERVER_RUNNING_ON_PORT: ${PORT}, BASE_PATH: ${BASE_PATH} ,TRUST_PROXY:${TRUST_PROXY}`);
console.log(`RATE_LIMIT: ${RATE_LIMIT}`);

const port = Number(PORT) || 8001;
const host = "0.0.0.0";
const app = express();

app.set('trust proxy', TRUST_PROXY || "127.0.0.1");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: Number(RATE_LIMIT)||100, // 每個 IP 1 分鐘內最多 100 個請求
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for ${req.ip}`);
    res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});

const swaggerUsers = {
  [process.env.SWAGGER_USER || "admin"]: process.env.SWAGGER_PW || "admin654321",
};

// 中間件設置
app.use(BASE_PATH || "/api", apiLimiter);
app.use(json({ limit: "10mb" }));
app.use(express.json());
app.use(morgan("combined"));
app.use(express.static("public"));
app.use(urlencoded({ extended: true }));
app.use(
  ["/openapi", `${BASE_PATH}/docs`, "/swagger"],
//   basicAuth({
//     users: swaggerUsers,
//     challenge: true,
//   }),
  swaggerUI.serve,
  swaggerUI.setup(swaggerJson)
);

// CORS 設置
if (!process.env.NODE_ENV) {
  app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
} else if (
  process.env.NODE_ENV === "dev" ||
  process.env.NODE_ENV === "development"
) {
  const allowedOrigins = [`http://localhost:${PORT}`, "http://localhost",FRONTEND_BASE_URL];
  app.use(
    cors({
      origin: (origin:any, callback:any) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error("您的CORS策略不允許這個來源。"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
}

// 初始化數據庫連接
initializeTypeORMDatabase(AppDataSource);

// 註冊路由
RegisterRoutes(app);

// 启动服务器
app.listen(port, host, () => {
  console.log(
    `API document available at http://localhost:${port}${BASE_PATH}/docs`
  );
});
