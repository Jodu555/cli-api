const { CommandManager } = require('./index');

commandmanager = CommandManager.createCommandManager(process.stdin, process.stdout);
console.log(commandmanager.unregisterCommand('c'));
class ProgressBar {
    constructor(max) {
        this.max = max;
        this.dots = '';
        this.empty = '';
        this.percent = 0;
        this.print();
    }

    print() {
        process.stdout.write(`\r[${this.dots}${this.empty}] ${this.percent}%`);
    }

    update(val) {
        this.dots = ".".repeat(val);
        const left = this.max - val;
        this.empty = " ".repeat(left);
        this.percent += val;
        this.print();
    }
}

// const bar = new ProgressBar(50);

// bar.update(25);
