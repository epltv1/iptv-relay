const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/live', async (req, res) => {
    const iptvUrl = "http://main.light-ott.net:80/play/live.php?mac=00:1A:79:3A:93:FD&stream=1745108&extension=.m3u8";
    const baseHost = "http://main.light-ott.net:80"; // The original streaming server

    res.setHeader('Content-Type', 'application/x-mpegURL');
    
    try {
        // Fetch the manifest as text instead of a raw stream pipeline
        const response = await axios.get(iptvUrl, { responseType: 'text' });
        let manifestText = response.data;
        
        // Find any lines starting with /hls/ and attach the original domain to them
        // This changes "/hls/abc.ts" into "http://main.light-ott.net:80/hls/abc.ts"
        const fixedManifest = manifestText.replace(/(\/hls\/[^\s]+)/g, `${baseHost}$1`);
        
        res.send(fixedManifest);
    } catch (error) {
        console.error("Failed to parse and fix manifest:", error.message);
        res.status(500).send("Stream currently unavailable.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Manifest parser running on port ${PORT}`);
});
