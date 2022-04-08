const express = require('express');
const app = express();
const port = 3000

app.get('/v1/user', (req, res) => {
    res.type('json').sendFile(__dirname + '/data/user.json');
});

app.get('/v1/user/1', (req, res) => {
    res.type('json').sendFile(__dirname + '/data/user-1.json');
});

app.listen(port, () => {
    console.log(`Exampl server listening on port ${port}`)
});
