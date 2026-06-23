const express = require('express');
const axios = require('axios');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/live.m3u8', async (req, res) => {
    // Expects you to call your URL like: /live.m3u8?token=jDMKtJWYRhSqWIkvoDFHMTLQOLcYSVRf&t1=1782162000&t2=1782189000
    const token = req.query.token || "jDMKtJWYRhSqWIkvoDFHMTLQOLcYSVRf";
    const t1 = req.query.t1 || "1782162000";
    const t2 = req.query.t2 || "1782189000";
    
    // Construct the actual target stream URL dynamically
    const targetM3u8Url = `https://netanyahu.indianservers.st/secure/${token}/${t1}/${t2}/tsn1/tracks-v1a1/mono.ts.m3u8`; 
    const baseHost = "https://netanyahu.indianservers.st";

    res.setHeader('Content-Type', 'application/x-mpegURL');

    try {
        const response = await axios.get(targetM3u8Url, {
            responseType: 'text',
            timeout: 6000,
            headers: {
                'Referer': 'https://ppv.to/',
                'Origin': 'https://ppv.to/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let manifestText = response.data;

        // Automatically prefix any relative video lines (.ts or .m3u8) with the original host domain
        const basePath = targetM3u8Url.substring(0, targetM3u8Url.lastIndexOf('/'));
        let fixedManifest = manifestText.replace(/^([^#\s].*)$/mg, (match) => {
            if (match.startsWith('/')) {
                return `${baseHost}${match}`;
            }
            if (!match.startsWith('http')) {
                return `${basePath}/${match}`;
            }
            return match;
        });

        res.send(fixedManifest);

    } catch (error) {
        console.error("Proxy Engine Error:", error.message);
        res.status(500).send("Stream expired or token invalid.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Dynamic security proxy running on port ${PORT}`);
});
