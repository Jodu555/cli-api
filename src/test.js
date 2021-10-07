const { createCommandManager, ProgressBar, Command } = require('./index');

commandmanager = createCommandManager(process.stdin, process.stdout);

commandmanager.registerCommand(new Command(['test', 't'], 'test/t', 'Test Command', () => 'This is a test'));

commandmanager.displayProgressBar('inst_1', new ProgressBar(50));
commandmanager.updateProgressBar('inst_1', 10)

