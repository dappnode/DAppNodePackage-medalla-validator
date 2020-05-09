import errorhandler from "errorhandler";
import logs from "./logs";
import app from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorhandler());
}

/**
 * Start Express server.
 */
const port = app.get("port");
const env = app.get("env");
const server = app.listen(app.get("port"), () => {
  logs.info(`App is running at http://localhost:${port} in ${env} mode`);
});

export default server;
