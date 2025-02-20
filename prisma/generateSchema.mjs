import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import debounce from "lodash.debounce";

// Convert `import.meta.url` to a file path and extract the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing prisma schema files
const schemasDir = path.join(__dirname, "schemas");
// Path to the main schema file
const schemaPrismaPath = path.join(__dirname, "schema.prisma");

// Object to keep track of file contents
const fileContents = {};

// Debounced function to update schema.prisma file
const updateSchemaPrisma = debounce(async () => {
  try {
    const combinedContent = Object.values(fileContents).join("\n");
    await fs.promises.writeFile(schemaPrismaPath, combinedContent);
    console.log("schema.prisma file updated.");
  } catch (err) {
    console.error(`Error updating schema.prisma: ${err}`);
  }
}, 100);

// Function to read file content and update the tracked content
const processFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    fileContents[filePath] = data;
    console.log(`Processed file ${filePath}.`);
    updateSchemaPrisma();
  } catch (err) {
    console.error(`Error processing file ${filePath}: ${err}`);
  }
};

export const schemaWatcher = () => {
  const watcher = chokidar.watch(`${schemasDir}/*.prisma`, {
    persistent: true,
  });

  watcher
    .on("add", (filePath) => {
      console.log(`File ${filePath} has been added`);
      processFile(filePath);
    })
    .on("change", (filePath) => {
      console.log(`File ${filePath} has been changed`);
      processFile(filePath);
    })
    .on("unlink", (filePath) => {
      console.log(`File ${filePath} has been removed`);
      delete fileContents[filePath];
      updateSchemaPrisma();
    });

  console.log("Watching for file changes...");
};

// if (process.env.NODE_ENV === "development") schemaWatcher();
schemaWatcher();
