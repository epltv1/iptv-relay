const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/live', async (req, res) => {
    const iptvUrl = "http://troublesupport.my.to:80/play/live.php?mac=00:1A:79:90:22:43&stream=904216&extension=.m3u8";
    res.setHeader('Content-Type', 'application/x-mpegURL');
    
    try {
        const response = await axios({
            method: 'get',
            url: iptvUrl,
            responseType: 'stream'
        });
        response.data.pipe(res);
    } catch (error) {
        console.error("Stream relay failed:", error.message);
        res.status(500).send("Stream currently unavailable.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Restreamer running on port ${PORT}`);
});
