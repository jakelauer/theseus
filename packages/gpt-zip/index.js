const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const ignore = require("ignore");
const klawSync = require("klaw-sync");

(async function () {
    // Get the current working directory
    const cwd = process.cwd();

    // Create a writable stream to the zip file
    const output = fs.createWriteStream(path.join(cwd, "output.zip"));
    const archive = archiver("zip", {
        zlib: { level: 9 }, // Highest compression level
    });

    output.on("close", function () {
        console.log(archive.pointer() + " total bytes");
        console.log("Archiver has been finalized and the output file descriptor has closed.");
    });

    archive.pipe(output);

    const FILE_IGNORE_PATH = path.join(cwd, ".gptignore");
    const gitignore = ignore();
    if (fs.existsSync(FILE_IGNORE_PATH)) {
        gitignore.add(fs.readFileSync(FILE_IGNORE_PATH).toString());
    }

    const files = klawSync(".", {
        nodir: true,
        filter: (item) => !item.path.includes("node_modules"), // Ignore node_modules directories
    });

    files
        .filter((file) => !gitignore.ignores(path.relative(".", file.path)))
        .forEach((file) => {
            const relativePath = path.relative(".", file.path);
            const stats = fs.statSync(file.path);
            if (stats.isFile()) {
                archive.file(file.path, { name: relativePath });
            }
        });

    // Finalize
    await archive.finalize();
})();
