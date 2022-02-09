import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import apiRouter from "./routes/api";

const app: Application = express();
const port = 3100;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Connected",
  });
});

app.use("/auth", authRouter);
app.use("/api", apiRouter);

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
