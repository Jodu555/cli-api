const { CommandManager } = require('./index');

commandmanager = CommandManager.createCommandManager(process.stdin, process.stdout);

commandmanager.displayProgressBar('inst_1', new CommandManager.ProgressBar(50));
commandmanager.updateProgressBar('inst_1', 10)

