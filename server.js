const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

// Point to the bundled ffmpeg binary
ffmpeg.setFfmpegPath(path.join(__dirname, 'ffmpeg', 'ffmpeg'));

const app = express();
const PORT = process.env.PORT || 3000;

const m3u8Input = 'https://example.com/playlist.m3u8';
const outputDir = path.join(__dirname, 'output');
const outputFileName = 'StarSports 1Tamil.mpd';
const outputMpd = path.join(outputDir, outputFileName);

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
        .on('start', cmd => console.log('FFmpeg command:', cmd))
        .on('end', () => {
            console.log('Conversion completed!');
            res.sendFile(outputMpd);
        })
        .on('error', err => {
            console.error('Error:', err);
            res.status(500).send('Conversion failed');
        })
        .run();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
