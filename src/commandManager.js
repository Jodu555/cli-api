//INFO: fixStdoutFor function from: https://stackoverflow.com/questions/10606814/readline-with-console-log-in-the-background
let commandManager = null;
const rdl = require('readline');

class Command {
    constructor(command, usage, description, callback) {
        this.ID = this.generateID();
        this.command = command;
        this.usage = usage;
        this.description = description;
        this.callback = callback;
    }
    generateID() {
        const min = 999999,
            max = 9999999999;
        return Math.floor(
            Math.random() * (max - min) + min
        )
    }
}

class ProgressBar {
    constructor(max, finishedSymbol = '=', emptySymbol = '-') {
        this.max = max;
        this.finishedSymbol = finishedSymbol;
        this.emptySymbol = emptySymbol;
        this.dots = '';
        this.empty = '';
        this.percent = 0;
    }

    print(stream) {
        this.stream.write(`\r[${this.dots}${this.empty}] ${this.percent}%`);
    }
    update(val) {
        const left = this.max - val;
        this.dots = this.finishedSymbol.repeat(val);
        this.empty = this.emptySymbol.repeat(left);
        this.percent += val;
        this.print();
    }
    clear() {
        this.stream.write(`\r\n`);
        console.log('');
    }
}

class CommandManager {
    constructor(streamIn, streamOut) {
        this.streamIn = streamIn;
        this.streamOut = streamOut;
        this.commands = new Map();
        this.progressBars = new Map();
        this.init();
    }
    init() {
        const cli = rdl.createInterface(this.streamIn, this.streamOut);
        this.fixStdoutFor(cli);
        cli.setPrompt("> ", 2);
        let backmessage;
        cli.on('line', (line) => {
            const command = line.split(' ')[0].toLowerCase().trim();
            if (this.commands.has(command))
                backmessage = this.commands.get(command).callback(command, line.split(' '), 'USER');
            if (backmessage) {
                Promise.resolve(backmessage).then((message) => {
                    if (Array.isArray(message))
                        message.forEach(msg => console.log(msg));
                    if (!Array.isArray(message))
                        console.log(message);
                })

            }
            cli.prompt();
        });
        cli.prompt();
        this.initializeDefaultCommands();
    }
    removeCommandByID(id) {
        let rem = false;
        this.commands.forEach((value, key) => {
            if (value.ID == id) {
                rem = true;
                return this.commands.delete(key);
            }
        });
        return rem;
    }
    getAllCommandsWithoutAliases() {
        const validIds = [];
        const finalCommands = [];
        this.commands.forEach(e1 => {
            if (!validIds.includes(e1.ID)) {
                validIds.push(e1.ID);
                finalCommands.push(e1);
            }
        });
        return finalCommands;
    }
    clear() {
        rdl.cursorTo(this.streamOut, 0, 0);
        rdl.clearScreenDown(this.streamOut);
    }
    initializeDefaultCommands() {
        this.registerCommand(new Command(['clear', 'c'], 'clear / c', 'To Clear the Screen', () => {
            this.clear();
        }))
        this.registerCommand(new Command('help', 'help', 'The Default help command!', (command, args, sender) => {
            console.log('------------------- HELP -------------------');
            console.log(' ');
            this.getAllCommandsWithoutAliases().forEach(command => {
                console.log('=> ' + (Array.isArray(command.command) ? command.command.join(', ') : command.command) + ' : ' + command.usage + ' : ' + command.description);
            });
            console.log(' ');
            console.log('------------------- HELP -------------------');
        }))
    }
    fixStdoutFor(cli) {
        const oldStdout = process.stdout;
        const newStdout = Object.create(oldStdout);
        newStdout.write = function () {
            cli.output.write('\x1b[2K\r');
            const result = oldStdout.write.apply(
                this,
                Array.prototype.slice.call(arguments)
            );
            cli._refreshLine();
            return result;
        }
        process.__defineGetter__('stdout', function () { return newStdout; });
    }
    registerCommand(command) {
        if (typeof command.command === 'string')
            this.commands.set(command.command.toLowerCase(), command);
        if (Array.isArray(command.command))
            command.command.forEach(commands => this.commands.set(commands.toLowerCase(), command));

    }
    unregisterCommand(command) {
        if (this.commands.get(command).ID)
            return this.removeCommandByID(this.commands.get(command).ID);
        return false;
    }
    displayProgressBar(name, bar) {
        if (!this.progressBars.has(name)) {
            bar.stream = this.streamOut;
            bar.print();
            this.progressBars.set(name, bar);
            return;
        }
        console.log('A Progress Bar with that identifier already exists!');
        return;
    }
    updateProgressBar(name, value) {
        const bar = this.progressBars.get(name);
        !bar && console.log('The Bar with ' + name + ' Identifier does not exists!');
        bar && bar.update(value);
        bar.clear();
    }
    finishProgressBar() {

    }
}

function createCommandManager(stdin, stdout) {
    this.commandManager = new CommandManager(stdin, stdout);
    return this.commandManager;
}

function getCommandManager() {
    return this.commandManager;
}

module.exports = { createCommandManager, getCommandManager, Command, ProgressBar }