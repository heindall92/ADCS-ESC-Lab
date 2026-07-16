const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ffmpeg = require("ffmpeg-static");
const ffprobe = require("ffprobe-static").path;

if (!ffmpeg || !ffprobe) {
  console.error("No se encontraron los binarios locales de FFmpeg/FFprobe.");
  process.exit(1);
}

const separator = process.platform === "win32" ? ";" : ":";
const toolPath = [path.dirname(ffmpeg), path.dirname(ffprobe)].join(separator);
const command = "npx";
const args = ["--yes", "hyperframes@0.7.60", ...process.argv.slice(2)];

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    FFMPEG_PATH: ffmpeg,
    FFPROBE_PATH: ffprobe,
    PATH: `${toolPath}${separator}${process.env.PATH ?? ""}`,
  },
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
