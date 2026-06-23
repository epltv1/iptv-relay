const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 1. The Main Player Page (Visitable on your phone/browser)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Futbol Live Stream</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            <style>
                body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; color: #fff; font-family: sans-serif; }
                .container { width: 100%; max-width: 800px; text-align: center; padding: 10px; }
                video { width: 100%; border: 2px solid #333; background: #111; border-radius: 8px; }
                h2 { margin-bottom: 15px; font-weight: 400; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Live Match Stream Feed</h2>
                <video id="video" controls autoplay muted playsinline></video>
            </div>

            <script>
                var video = document.getElementById('video');
                // Point directly to your internal proxy endpoint
                var videoSrc = '/live'; 

                if (Hls.isSupported()) {
                    var hls = new Hls({
                        maxMaxBufferLength: 10,
                        liveSyncDurationCount: 3
                    });
                    hls.loadSource(videoSrc);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    // Fallback for Safari/iOS devices
                    video.src = videoSrc;
                }
            </script>
        </body>
        </html>
    `);
});

// 2. The Fixed Stream Engine
app.get('/live', async (req, res) => {
    const iptvUrl = "http://main.light-ott.net:80/play/live.php?mac=00:1A:79:3A:93:FD&stream=1745108&extension=.m3u8";
    const baseHost = "http://main.light-ott.net:80";

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
