import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const apiUploadUrl = "https://webhook.site/72b49f57-e259-4dbf-a07c-212230f9097b";
const apiEndpointUrl = 'https://webhook.site/token/72b49f57-e259-4dbf-a07c-212230f9097b/requests';

export function onAddNewBMS(path: string) {
    console.log('onAddNewBMS ------------', path);
    return;
    const fileStream = fs.createReadStream(path)
    const formData = new FormData();
    formData.append('file', fileStream);
    
    axios.post(apiUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      console.log('File uploaded successfully', response.data);
    })
    .catch((error) => {
      console.error('Error uploading file', error);
    });
}

export function onUpdateBMS(path: string) {
    console.log('onUpdateBMS ------------', path);
    return;
    const fileStream = fs.createReadStream(path)
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('isUpdate', 'true');
    
    axios.post(apiUploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      console.log('File uploaded successfully', response.data);
    })
    .catch((error) => {
      console.error('Error uploading file', error);
    });
}

export function onDelBMS(path: string) {
    console.log(`onDelBMS ------- ${path}`);
}

export function getFileHistory() {
    return new Promise((resolve, reject) =>{
        axios.get(apiEndpointUrl)
            .then(res=>resolve(res.data))
            .catch(err=> reject(err))
    })
}