import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config";
const app: Application = express();
const port = config.port

app.use(express.json()); // middler for json type data
app.use(express.text()); // middler for text type data
app.use(express.urlencoded({ extended: true })); // middler for object type

const pool = new Pool({
  connectionString: config.connection_string
});

const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(20) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            age INT,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

    console.log("Database connected");
  } catch (error) {
    console.error(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  //   res.send('Hello World!')
  res.status(200).json({
    message: "Express Server",
    author: "Ami",
  });
});

app.post("/api/users", async (req: Request, res: Response) => {
  // console.log(req.body);
  const { name, email, password, age } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, age)
    VALUES($1, $2, $3, $4)
    RETURNING *
    `,
      [name, email, password, age],
    );
    // console.log(result);

    res.status(201).json({
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error.detail,
    });
  }
});

// Get all users from database
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
            SELECT * FROM users
            `);
    console.log(result);

    if (result.rows.length === 0) {
      res.status(200).json({
        success: true,
        message: "No user found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully fetched users",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
});

// Get single user from database using params
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const result = await pool.query(
      `
            SELECT * FROM users WHERE id=$1
            `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `
            UPDATE users
            SET email=$1, password=$2
            WHERE id=$3

            RETURNING *
            `,
      [email, password, id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
       DELETE FROM users
       WHERE id=$1
      `, [id]
    );
    
    if(result.rows.length === 0){
        res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.detail,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
