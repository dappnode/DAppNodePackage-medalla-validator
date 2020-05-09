const chokidar = require("chokidar");
const child = require("child_process");

// One-liner for current directory
chokidar
  .watch("common", {
    ignoreInitial: true
  })
  .on("all", (event, path) => {
    console.log("Building and copying common");
    const p = child.exec("npm run common-build && npm run common-copy");
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
  });
