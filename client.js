const WebSocket = require('ws');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let serverAddress = '127.0.0.1'; // server IP
let serverPort = 8080;           // server port
let ws; // WebSocket instance
const clientUUID = uuidv4(); // Генерация UUID для клиента

function startClient() {
    const url = `ws://${serverAddress}:${serverPort}`;
    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log(`Connected to server at ${url}`);
        console.log(`Client UUID: ${clientUUID}`);

        // Отправляем UUID клиента серверу
        ws.send(JSON.stringify({ type: 'INIT', clientUUID: clientUUID }));
    });

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type === 'INIT_CONFIRMATION') {
                // Получено подтверждение подключения
                console.log(`Server UUID: ${parsedMessage.serverUUID}`);
                console.log(`Client UUID confirmed by server: ${parsedMessage.clientUUID}`);
            } else if (parsedMessage.type === 'COMMAND') {
                // Получена команда от сервера
                console.log('Received command from server:', parsedMessage);

                // Формируем ответ только на команды
                const response = {
                    id: parsedMessage.id || uuidv4(),
                    command: parsedMessage.command,
                    result: 'success',
                    data: { message: `Response to ${parsedMessage.command}` }
                };

                console.log('Response sent:', response);
                ws.send(JSON.stringify(response));
            } else {
                console.log('Unhandled message type:', parsedMessage);
            }
        } catch (error) {
            console.error('Error processing message from server:', error);
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}


rl.question('Enter server IP (default is 127.0.0.1): ', (ip) => {
    if (ip) serverAddress = ip;

    rl.question('Enter server port (default is 8080): ', (port) => {
        if (port) serverPort = parseInt(port, 10);

        startClient();
        rl.close();
    });
});
