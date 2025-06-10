const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Setup Express
const app = express();
const PORT = process.env.PORT || 3000;

// Path to bundled FFmpeg binary
ffmpeg.setFfmpegPath(path.join(__dirname, 'ffmpeg', 'ffmpeg'));

// Input M3U8 (change this to your stream)
const m3u8Input = 'http://ptu.ridsys.in/riptv/live/stream20/index.m3u8'; // ✅ working test URL

// Output path
const outputDir = path.join(__dirname, 'output');
const outputFileName = 'StarSports1Tamil.mpd';
const outputMpd = path.join(outputDir, outputFileName);

// Serve output folder
app.use('/output', express.static(outputDir));

// Conversion route
app.get('/convert', (req, res) => {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    ffmpeg(m3u8Input)
        .outputOptions([
            '-map 0',
            '-c:v copy',
            '-c:a copy',
            '-f dash'
        ])
        .output(outputMpd)
        .on('start', cmd => {
            console.log('FFmpeg command:', cmd);
        })
        .on('stderr', line => {
            console.log('FFmpeg log:', line);
        })
        .on('end', () => {
            console.log('✅ Conversion completed.');
            res.send(`MPD available at: /output/${outputFileName}`);
        })
        .on('error', err => {
            console.error('❌ FFmpeg error:', err.message);
            res.status(500).send('Conversion failed. See logs.');
        })
        .run();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
