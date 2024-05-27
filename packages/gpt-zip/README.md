
# Repository Zipper Script

This script zips the current repository into a `output.zip` file, excluding files specified in a `.gptignore` file and the `node_modules` directory. This is useful for uploading the repository to ChatGPT for assistance with writing documentation and tests.

## Requirements

- Node.js
- PNPM

## Usage

1. The `.gptignore` file in the root directory of `gpt-zip` specifies files & directories to exclude from the zip file.
2. Run the script using Node.js:

```bash
pnpm start
```

This will create a `output.zip` file in the current working directory, containing the repository files, excluding those specified in the `.gptignore` file and the `node_modules` directory.

## Example `.gptignore` File

```plaintext
# Ignore all log files
*.log

# Ignore build directory
build/

# Ignore test files
test/
```

## Output

The script logs the total bytes written and confirms that the archiver has finalized and the output file descriptor has closed.

## License

This script is provided as-is, without any warranty. Use it at your own risk.

---

Feel free to modify this script and README as needed for your specific use case.
