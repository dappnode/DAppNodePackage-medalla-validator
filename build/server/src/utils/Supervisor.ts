import { spawn, ChildProcess } from "child_process";

type ChildProcessWithExitCode = ChildProcess & {
  /**
   * The subprocess.exitCode property indicates the exit code of the child process.
   * If the child process is still running, the field will be null.
   * https://nodejs.org/api/child_process.html#child_process_subprocess_exitcode
   */
  exitCode?: number | null;
};

const signalsToPass: NodeJS.Signals[] = [
  "SIGTERM",
  "SIGINT",
  "SIGHUP",
  "SIGQUIT"
];

class TimeoutError extends Error {}

/**
 * Restarts a child process when it crashes
 * A restart can also be triggered manually
 * Typescript translation of https://github.com/petruisfan/node-supervisor
 * @param command
 * @param args
 * @param options
 */
export class Supervisor {
  // Settings
  private command: string;
  private args: string[];
  private timeoutKill: number = 10 * 1000;
  private restartWait: number = 1000;
  private resolveStartOnData: boolean = false;
  private log: (msg: string) => void = console.log;

  // State
  private child: ChildProcessWithExitCode | null = null;
  private status: "killing" | "starting" | null = null;

  constructor(
    command: string,
    args: string[],
    options: {
      timeoutKill?: number; // Timeout to kill process with "SIGKILL" after "SIGTERM"
      restartWait?: number; // Wait between restarts
      resolveStartOnData?: boolean; // Resolve the start call once 'data' event is received
      log?: (message: string) => void;
    } = {}
  ) {
    this.command = command;
    this.args = args;
    if (options) {
      if (options.timeoutKill) this.timeoutKill = options.timeoutKill;
      if (options.restartWait) this.restartWait = options.restartWait;
      if (options.log) this.log = options.log;
    }

    // Pass kill signals through to child
    const onParentKill = (signal: NodeJS.Signals) => {
      if (!this.child) return;
      this.log(`Received ${signal}, killing child process...`);
      this.child.removeAllListeners();
      this.child.kill(signal);
      process.exit(); // MUST exit otherwise the stop sequence is aborted
    };
    for (const signal of signalsToPass)
      process.on(signal, onParentKill.bind(this, signal));
    process.on("exit", onParentKill.bind(this, "SIGTERM"));
  }

  /**
   * kill child_process first with SIGTERM, then SIGKILL
   * Can only be called once at a time, otherwise will error
   */
  async kill() {
    try {
      if (!this.child) return;
      if (this.status !== null) throw Error(`status = ${this.status}`);
      this.status = "killing";

      // Remove crash listeners, to prevent triggering an automatic restart
      this.child.removeAllListeners();

      // First, try to kill with SIGTERM
      process.kill(this.child.pid, "SIGTERM");
      try {
        await this.waitExit(this.timeoutKill);
      } catch (e) {
        if (e instanceof TimeoutError) {
          // Kill for good if necessary
          process.kill(this.child.pid, "SIGKILL");
          await this.waitExit(this.timeoutKill);
        }
      }

      // Make sure the process is exited
      if (!isExited(this.child)) {
        throw Error(`child process is not exited after SIGKILL`);
      }
    } catch (e) {
      this.status = null;
      throw e;
    }
  }

  /**
   * Start child_process and add listener to restart it on exit
   * If resolveStartOnData = true, will wait for first 'data' event
   * Can only be called once at a time, otherwise will error
   */
  async start() {
    try {
      if (this.status !== null) throw Error(`status = ${this.status}`);
      this.status = "starting";

      const child = spawn(this.command, this.args);
      const cmdStr = `'${this.command} ${this.args.join(" ")}'`;
      this.log(`Starting child process with ${cmdStr} ${child.pid}`);
      this.child = child;

      // Pipe output
      if (child.stdout) child.stdout.pipe(process.stdout);
      if (child.stderr) child.stderr.pipe(process.stderr);

      const that = this;
      child.addListener("exit", async code => {
        that.log(`Program ${cmdStr} exited with code ${code}`);
        await pause(that.restartWait);
        that.start();
      });

      if (this.resolveStartOnData && child.stdout)
        await new Promise((resolve, reject) => {
          child.stdout.once("data", resolve);
          child.once("error", reject);
          child.once("exit", code => reject(Error(`Exited ${code}`)));
        });
    } catch (e) {
      this.status = null;
      throw e;
    }
  }

  /**
   * Kill child_process, then start
   * @see kill
   * @see start
   */
  async restart() {
    await this.kill();
    await this.start();
  }

  /**
   * Waits for the current child's exit event once
   * Must supply a timeout to prevent infinite waits
   * @param timeout In ms
   */
  private async waitExit(
    timeoutMs: number
  ): Promise<"already-exited" | number | null> {
    const child = this.child;
    if (!child || isExited(child)) return "already-exited";
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TimeoutError(`Timeout ${timeout}`));
      }, timeoutMs);
      child.once("exit", code => {
        clearTimeout(timeout);
        resolve(code);
      });
    });
  }
}

/**
 * Util: Checks if a child_process is exited.
 * True if it has a non null exitCode
 * @param child
 */
function isExited(child: ChildProcessWithExitCode): boolean {
  return typeof child.exitCode === "number";
}

/**
 * Util: timeout `ms` miliseconds
 */
function pause(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
