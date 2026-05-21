import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db";
import { userRoute } from "./modules/user/user.route";
import { profileRoute } from "./modules/profile/profile.route";
const app: Application = express();

app.use(express.json()); // middler for json type data
app.use(express.text()); // middler for text type data
app.use(express.urlencoded({ extended: true })); // middler for object type


app.get("/", (req: Request, res: Response) => {
  //   res.send('Hello World!')
  res.status(200).json({
    message: "Express Server",
    author: "Ami",
  });
});

app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);

export default app;
