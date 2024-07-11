// imgurUploader.js
const axios = require('axios');
const FormData = require('form-data');

const uploadToImgur = async (imageBuffer, imageName) => {
    const clientId = '22c5963fbc6bc2f'; // Reemplaza con tu propio ID de cliente de Imgur
    const endpoint = 'https://api.imgur.com/3/image';

    try {
        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: imageName });

        const imgurResponse = await axios.post(endpoint, formData, {
            headers: {
                'Authorization': `Client-ID ${clientId}`,
                ...formData.getHeaders(),
            },
        });
        console.log(imgurResponse.data.data, 'datos');
        return imgurResponse.data;
    } catch (error) {
        console.error('Error al subir la imagen a Imgur:', error);
        throw new Error('Failed to upload image to Imgur');
    }
};

module.exports = uploadToImgur;
