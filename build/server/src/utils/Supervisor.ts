import { spawn, ChildProcess } from "child_process";

const signalsToPass: NodeJS.Signals[] = [
  "SIGTERM",
  "SIGINT",
  "SIGHUP",
  "SIGQUIT"
];

interface SupervisorOptions {
  timeoutKill?: number; // Timeout to kill process with "SIGKILL" after "SIGTERM"
  restartWait?: number; // Wait between restarts
  resolveStartOnData?: boolean; // Resolve the start call once 'data' event is received
  log?: (message: string) => void;
}

class TimeoutError extends Error {}

type ChildProcessWithExitCode = ChildProcess & { exitCode?: number | null };

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
  command: string;
  args: string[];
  timeoutKill: number = 10 * 1000;
  restartWait: number = 1000;
  resolveStartOnData: boolean = false;
  log: (msg: string) => void = console.log;

  // State
  child: ChildProcessWithExitCode | null = null;
  private crash_queued: boolean = false;
  private status: "killing" | "starting" | null;

  constructor(
    command: string,
    args: string[],
    options: SupervisorOptions = {}
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

  async kill() {
    if (this.crash_queued || !this.child) return;

    this.crash_queued = true;
    await pause(50);

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
    if (this.child.exitCode === null) {
      throw Error(`child process is not exited after SIGKILL`);
    }
  }

  async start() {
    this.crash_queued = false;
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
      await new Promise(r => child.stdout.once("data", r));
  }

  async restart() {
    if (this.crash_queued) return;
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
    if (!child || typeof child.exitCode === "number") return "already-exited";
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

function pause(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
