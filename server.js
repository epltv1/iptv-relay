const express = require('express');
const axios = require('axios');
const app = express();

// Enable CORS so JW Player on your site can access the stream
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/live', async (req, res) => {
    // Your updated test IPTV URL
    const iptvUrl = "http://main.light-ott.net:80/play/live.php?mac=00:1A:79:3A:93:FD&stream=1745108&extension=.m3u8";
    
    res.setHeader('Content-Type', 'application/x-mpegURL');
    
    try {
        // Pull the live stream data from the new host
        const response = await axios({
            method: 'get',
            url: iptvUrl,
            responseType: 'stream'
        });
        
        // Relay the data directly to the user's web browser
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
