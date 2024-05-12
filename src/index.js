import connections from "./db/connection.js";
import dotenv from "./utils/dotenv.config.js";
import app from "./app.js";
connections();

app.listen(process.env.PORT);
