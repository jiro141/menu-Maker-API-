// En tu archivo uploadRoute.js

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
    
    try {
        const { buffer, originalname } = req.file;
        const response = await uploadToImgur(buffer, originalname);
        res.json(response);
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const uploadToImgur = async (imageBuffer, imageName) => {
    const clientId = '22c5963fbc6bc2f'; // Reemplaza con tu propio ID de cliente de Imgur
    const endpoint = 'https://api.imgur.com/3/image';

    try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/*' });
        formData.append('image', blob, imageName);

        // Construimos los encabezados manualmente
        const headers = {
            'Authorization': `Client-ID ${clientId}`,
        };

        const imgurResponse = await axios.post(endpoint, formData, { headers });

        return imgurResponse.data;
    } catch (error) {
        console.error('Error al subir la imagen a Imgur:', error);
        throw new Error('Failed to upload image to Imgur');
    }
};




module.exports = router;
