#!/usr/bin/env node
import minimist from "minimist";
import { detectPackageManager } from "./utils";

const args = minimist(process.argv.slice(2))

const packageManager = detectPackageManager();

console.log(detectPackageManager(), args)