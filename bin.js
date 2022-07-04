#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
(0, _1.main)({ mode: process.argv[2] || 'dev' }).catch(error => {
    console.error(error);
    process.exit(1);
});
