import { spawn, ChildProcess } from "child_process";

const signalsToPass: NodeJS.Signals[] = [
  "SIGTERM",
  "SIGINT",
  "SIGHUP",
  "SIGQUIT"
];

/**
 * Restarts a child process when it crashes
 * A restart can also be triggered manually
 * Typescript translation of https://github.com/petruisfan/node-supervisor
 * @param command
 * @param args
 * @param options
 */
export function Supervisor(
  command: string,
  args: string[],
  options?: {
    instantKill: boolean; // Kill process immediately with "SIGKILL"
    restartWait: number; // Wait between restarts
    log: (message: string) => void;
  }
) {
  const { instantKill, restartWait = 1000, log = console.log } = options || {};
  // State
  let child: ChildProcess | null = null;
  let crash_queued: boolean = false;

  // Pass kill signals through to child
  for (const signal of signalsToPass) {
    process.on(signal, function() {
      killChild(signal);
      process.exit();
    });
  }
  process.on("exit", function() {
    killChild("SIGTERM");
  });

  function killChild(signal: NodeJS.Signals | number) {
    if (child) {
      log("Received " + signal + ", killing child process...");
      child.kill(signal);
    }
  }

  function startChild() {
    crash_queued = false;
    child = spawn(command, args, { stdio: "inherit" });
    log(
      `Starting child process with '${command} ${args.join(" ")}' ${child.pid}`
    );

    // Pipe output
    if (child.stdout) child.stdout.pipe(process.stdout);
    if (child.stderr) child.stderr.pipe(process.stderr);

    child.addListener("exit", function(code) {
      if (!crash_queued) {
        log(`Program ${command} ${args.join(" ")} exited with code ${code}`);
        child = null;
      }
      setTimeout(startChild, restartWait);
    });
  }

  function restartChild() {
    if (crash_queued) return;

    crash_queued = true;
    setTimeout(function() {
      if (!child) return startChild();
      if (instantKill) {
        process.kill(child.pid, "SIGKILL");
      } else {
        process.kill(child.pid, "SIGTERM");
      }
    }, 50);
  }

  return {
    restart: restartChild,
    child
  };
}
