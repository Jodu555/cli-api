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

class CommandManager {
    constructor(streamIn, streamOut) {
        this.streamIn = streamIn;
        this.streamOut = streamOut;
        this.commands = new Map();
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
        console.log(id);
        this.commands.forEach((value, key) => {
            if (value.ID == id)
                this.commands.delete(key);
        });
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
}

function createCommandManager(stdin, stdout) {
    this.commandManager = new CommandManager(stdin, stdout);
    return this.commandManager;
}

function getCommandManager() {
    return this.commandManager;
}

module.exports = { createCommandManager, getCommandManager, Command }