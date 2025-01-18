const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let serverAddress = '127.0.0.1'; // Default server IP
let serverPort = 8080;           // Default server port


function askForCommand() {
    rl.question('Choose a command:\n1. CMD_SHIFT_INFO\n2. CMD_CARD_READ\n3. CMD_PASS_TRANSPORT_CARD\n4. CMD_PASS_BANK_CARD\n5. CMD_ABORT\n6. Exit\nEnter your choice: ', (choice) => {
        const commands = [
            'CMD_SHIFT_INFO',
            'CMD_CARD_READ',
            'CMD_PASS_TRANSPORT_CARD',
            'CMD_PASS_BANK_CARD',
            'CMD_ABORT'
        ];

        if (choice === '6') {
            client.end();
            rl.close();
            console.log('Exiting...');
            return;
        }

        const command = commands[parseInt(choice) - 1];
        if (command) {
            let request = {
                id: generateGUID(),
                command: command
            };

            if (['CMD_CARD_READ', 'CMD_PASS_TRANSPORT_CARD', 'CMD_PASS_BANK_CARD'].includes(command)) {
                request.timeout = 15000; 
            }

            client.write(JSON.stringify(request));
        } else {
            console.log('Invalid choice');
        }
        askForCommand(); 
    });
}

const client = new net.Socket();


function connectToServer() {
    client.connect(serverPort, serverAddress, () => {
        console.log('Connected to server');
        askForCommand();
    });

    client.on('data', (data) => {
        console.log('Received from server:', data.toString());
    });

    client.on('close', () => {
        console.log('Connection closed');
    });

    client.on('error', (err) => {
        console.log(`Connection error: ${err.message}`);
        rl.close();
    });
}

// IP
rl.question('Enter server IP (default is 127.0.0.1): ', (input) => {
    if (input) {
        serverAddress = input;
    }
    connectToServer();
});

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
