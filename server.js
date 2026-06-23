const express = require('express');
const axios = require('axios');
const app = express();

// Enable CORS so your website player doesn't block the link
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Changed route from '/live' to '/live.m3u8'
app.get('/live.m3u8', async (req, res) => {
    const iptvUrl = "http://main.light-ott.net:80/play/live.php?mac=00:1A:79:3A:93:FD&stream=1745108&extension=.m3u8";
    const baseHost = "http://main.light-ott.net:80";

    // Standard header telling players this is an HLS livestream playlist
    res.setHeader('Content-Type', 'application/x-mpegURL');
    
    try {
        const response = await axios.get(iptvUrl, { responseType: 'text', timeout: 5000 });
        let manifestText = response.data;
        
        // Converts relative /hls/ paths to full absolute URLs pointing to main.light-ott.net
        const fixedManifest = manifestText.replace(/(\/hls\/[^\s]+)/g, `${baseHost}$1`);
        
        res.send(fixedManifest);
    } catch (error) {
        console.error("Engine Error:", error.message);
        res.status(500).send("Stream source offline or link expired.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
