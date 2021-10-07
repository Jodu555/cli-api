const { createCommandManager, ProgressBar, Command } = require('./index');

commandmanager = createCommandManager(process.stdin, process.stdout);

commandmanager.displayProgressBar('inst_1', new ProgressBar(50));
commandmanager.updateProgressBar('inst_1', 10)

