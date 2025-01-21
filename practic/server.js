const net = require('net');

const responses = {
    "CMD_SHIFT_INFO": {
        "id": "c45e2594-07a4-400d-9038-2457a3036c80",
        "command": "CMD_SHIFT_INFO",
        "result": "success",
        "data": {
            "shuftId": 1,
            "route": "111К",
            "tn": "123"
        },
        "mac": "xdolobsyyuoerdcyvwipuymcgrfnpkgs"
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
    "CMD_PASS_TRANSPORT_CARD": {  // Исправлено название команды
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

const server = net.createServer((socket) => {
    console.log('Client connected');
    
    socket.on('data', (data) => {
        try {
            const request = JSON.parse(data);
            if (responses[request.command]) {
                const response = responses[request.command];
                socket.write(JSON.stringify(response));
            } else {
                socket.write(JSON.stringify({ error: "Unknown command" }));
            }
        } catch (error) {
            console.error('Error processing request:', error);
            socket.write(JSON.stringify({ error: "Invalid request format" }));
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
