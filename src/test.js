const { commandManager } = require('./index');

commandManager.createCommandManager(process.stdin, process.stdout);

console.log();