const WebSocket = require('ws');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let connectedClient = null;
const serverUUID = uuidv4(); // Генерация UUID для сервера
let clientUUID = null; // UUID клиента, который будет принят от клиента

const responses = {
    "CMD_SHIFT_INFO": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_SHIFT_INFO",
        "type": "COMMAND",
        "data": {
            "shuftId": 1,
            "route": "111К",
            "tn": "123"
        }
    },
    "CMD_CARD_READ": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_CARD_READ",
        "result": "success",
        "data": {
            "date": 1730200400,
            "cardType": "transport",
            "cardNumber": "11111111",
            "cardSeries": 16,
            "cardPdType": "EP",
            "cardStatus": "active",
            "cardPassBalance": 3,
            "cardBalance": 14.50,
            "cardExpirationDate": 1730200400,
            "ticketExpirationDate": 1730200400,
            "whiteListSeries": 12,
            "firstname": "Иван",
            "secondname": "Иванов",
            "patronymic": "Иванович",
            "preferenceCode": "A",
            "cardNumberRL": "1234567890123456789"
        },
        "mac": "xdolobsyyuoerdcyvwipuymcgrfnpkgs"
    },
    "CMD_PASS_TRANSPORT_CARD": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_PASS_TRANSPORT_CARD",
        "result": "success",
        "data": {
            "date": 1730200400,
            "cardNumber": "11111111",
            "cardSeries": 16,
            "cardPdType": "EP",
            "cardStatus": "active",
            "cardBalanceAfterPass": 14.3,
            "amountPass": 11.3
        },
        "mac": "xdolobsyyuoerdcyvwipuymcgrfnpkgs"
    },
    "CMD_PASS_BANK_CARD": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_PASS_BANK_CARD",
        "result": "success",
        "data": {
            "date": 1730200400,
            "cardType": "bank",
            "cardNumber": "11111111",
            "cardSeries": 16,
            "cardPdType": "EP",
            "cardStatus": "active",
            "amountPass": 11.3
        },
        "mac": "xdolobsyyuoerdcyvwipuymcgrfnpkgs"
    },
    "CMD_ABORT": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_ABORT",
        "result": "success",
        "mac": "xdolobsyyuoerdcyvwipuymcgrfnpkgs"
    }
};

function startServer(ip, port) {
    const wss = new WebSocket.Server({ host: ip, port: port }, () => {
        console.log(`WebSocket server is listening on ws://${ip}:${port}`);
        console.log(`Server UUID: ${serverUUID}`);
    });

    wss.on('connection', (ws) => {
        if (connectedClient) {
            ws.close(1000, "Another client is already connected.");
            return;
        }

        console.log('Client connected');
        connectedClient = ws;

        ws.on('message', (message) => {
            try {
                const request = JSON.parse(message);

                if (request.type === 'INIT' && request.clientUUID) {
                    clientUUID = request.clientUUID;
                    console.log(`Client UUID received: ${clientUUID}`);

                    // Отправляем подтверждение клиенту
                    ws.send(JSON.stringify({
                        type: 'INIT_CONFIRMATION',
                        serverUUID: serverUUID,
                        clientUUID: clientUUID
                    }));
                } else {
                    console.log('Received from client:', request);
                }
            } catch (error) {
                console.error('Error processing client message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            connectedClient = null;
        });

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });

        startCommandLoop(ws);
    });

    wss.on('error', (err) => {
        console.error('WebSocket server error:', err);
    });
}

function startCommandLoop(client) {
    console.log('Choose a command to send:');
    console.log('1. CMD_SHIFT_INFO');
    console.log('2. CMD_CARD_READ');
    console.log('3. CMD_PASS_TRANSPORT_CARD');
    console.log('4. CMD_PASS_BANK_CARD');
    console.log('5. CMD_ABORT');
    console.log('6. Exit');

    rl.on('line', (input) => {
        let command = null;
        switch (input.trim()) {
            case '1':
                command = responses["CMD_SHIFT_INFO"];
                break;
            case '2':
                command = responses["CMD_CARD_READ"];
                break;
            case '3':
                command = responses["CMD_PASS_TRANSPORT_CARD"];
                break;
            case '4':
                command = responses["CMD_PASS_BANK_CARD"];
                break;
            case '5':
                command = responses["CMD_ABORT"];
                break;
            case '6':
                console.log('Exiting...');
                process.exit(0);
            default:
                console.log('Invalid choice. Try again.');
                return;
        }

        if (command) {
            console.log('Sending to client:', command);
            client.send(JSON.stringify(command));
        }
    });
}

rl.question('Enter server IP (default is 127.0.0.1): ', (ip) => {
    if (!ip) ip = '127.0.0.1';
    rl.question('Enter server port (default is 8080): ', (port) => {
        if (!port) port = 8080;
        startServer(ip, parseInt(port));
    });
});
