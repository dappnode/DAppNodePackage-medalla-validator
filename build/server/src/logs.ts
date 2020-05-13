const LOG_LEVEL = process.env.LOG_LEVEL;
const cwd = __dirname;

const tags = {
  debug: "\x1b[35mdebug\x1b[0m", // magenta
  info: "\x1b[32minfo \x1b[0m", // green
  warn: "\x1b[33mwarn \x1b[0m", // yellow
  error: "\x1b[31merror\x1b[0m" // red
};

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
export const logs = {
  /**
   * Allows to log any type of data. Strings will be shown first.
   * Only shown if `process.env.LOG_LEVEL === "debug"`
   * ```js
   * logs.debug("some process", ["arg", "arg"], id);
   * ```
   */
  debug: formatLogger(
    tags.debug,
    LOG_LEVEL === "debug" ? console.debug : () => {}
  ),
  /**
   * Allows to log any type of data. Strings will be shown first.
   * ```js
   * logs.info(req.body, "first", [1, 2, 3], "second");
   * ```
   */
  info: formatLogger(tags.info, console.log),
  /**
   * Allows to log any type of data. Strings will be shown first.
   * Use `ErrorNoStack` to hide the stack
   * ```js
   * logs.warn("error fetching", new ErrorNoStack("DAMNN"));
   * ```
   */
  warn: formatLogger(tags.warn, console.warn),
  /**
   * Allows to log any type of data. Strings will be shown first.
   * Use `ErrorNoStack` to hide the stack
   * ```js
   * logs.error("error fetching", new Error("DAMNN"));
   * ```
   */
  error: formatLogger(tags.error, console.error)
};
/* eslint-enable @typescript-eslint/no-empty-function */
/* eslint-enable no-console */

export class ErrorNoStack extends Error {}

function formatLogger(tag: string, logger: (...args: any[]) => void) {
  return function log(
    ...items: (string | Error | { [key: string]: any })[]
  ): void {
    try {
      const caller = parseCallerFromStack(new Error().stack || "");
      const data = items
        // String first
        .sort(function compare(a, b) {
          const aIsString = typeof a === "string";
          const bIsString = typeof b === "string";
          if (aIsString && !bIsString) return -1;
          if (!aIsString && bIsString) return 1;
          return 0;
        })
        // Error last
        .sort(function compare(a, b) {
          const aIsError = a instanceof Error;
          const bIsError = b instanceof Error;
          if (aIsError && !bIsError) return 1;
          if (!aIsError && bIsError) return -1;
          return 0;
        })
        .map(item => {
          if (item instanceof ErrorNoStack) return item.message;
          if (item instanceof Error) return item.stack || item.message;
          if (typeof item === "string") return item;
          if (typeof item === "object") return JSON.stringify(item, null, 2);
          return item;
        });
      logger(tag, `[${caller}]`, ...data);
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(`ERROR LOGGING ITEMS: ${e.stack}`);
      logger(items);
    }
  };
}

/**
 * Grab the second relative path given a stack
 * Uses indexOf instead of split for efficiency
 * Does not error if the stack is faulty
 * The stack should be grabbed in the function called by the consumer
 * Error:
 *   at Object.logModule (~/dappnode/DAppNodePackage-prysm-validator/build/api/server/src/logs.ts:7:15)
 *   at ~/dappnode/DAppNodePackage-prysm-validator/build/api/server/src/routes/rpc.ts:12:3
 *   at Layer.handle [as handle_request] (~/dappnode/DAppNodePackage-prysm-validator/build/api/server/node_modules/express/lib/router/layer.js:95:5)
 * @param stack
 * @return "routes/rpc.ts:12:3"
 */
function parseCallerFromStack(stack: string): string {
  const fromFirstLine = stack.slice(stack.indexOf("\n") + 2);
  const fromSecondLine = fromFirstLine.slice(fromFirstLine.indexOf("\n") + 2);
  const thirdLine = fromSecondLine.slice(0, fromSecondLine.indexOf("\n"));
  // Stack maybe prefixed by the function name
  //    at Object.dbFactory (/home/lion/Code/dappnode/DAppNodePackage-prysm-validator/build/api/server/src/db/dbFactory.ts:19:10)
  let relativePath = thirdLine.split(cwd)[1] || "";
  // Remove the forward slash "/"
  if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);
  // Remove the trailing ")"
  if (relativePath.endsWith(")")) relativePath = relativePath.slice(0, -1);
  // Remove the column location
  relativePath = relativePath.slice(0, relativePath.lastIndexOf(":"));

  return relativePath;
}
