import fs from 'fs'
import {read} from 'to-vfile'
import axios from 'axios'
import { generateManifest } from './manifest.mjs'

export async function uploadAssets(path) {
    // Find all files in `assets`
    let assetFiles = []
    fs.readdirSync(path).forEach(file => {
        if(file != 'manifest.json') { assetFiles.push(path + '/' + file) }
    });

    console.log('')
    // upload all assets to `polyscribe` folder in course
    for(const file of assetFiles) {
        await uploadFile(file)
    }
    console.log('')

    // generate assets/manifest.json
    // global.manifest.assets = await generateManifest(path)
}

export async function uploadFile(filePath) {
    // upload the file & return the File object
    let stats = fs.statSync(filePath);
    let fileSizeInBytes = stats.size;
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
    const fileInfo = {
        name: fileName,
        parent_folder_path: 'polyscribe',
        size: fileSizeInBytes
    }

    const info = await axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/files`, fileInfo, {
        headers: { 'Authorization': `Bearer ${global.secret}`}
    })

    const uploadRes = await axios.post(info.data.upload_url, {
        ...info.data.upload_params,
        file: fs.createReadStream(filePath)
        }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    const confirmRes = await axios.get(uploadRes.data.location, { headers : {
        "Authorization": `Bearer ${global.secret}`
    }})
    console.log(`Uploaded file ${confirmRes.data.filename} to Canvas, assigned ID ${confirmRes.data.id}`)
}

export function getAssetId(src, manifest) {
    // Get image ID from assets/manifest.yaml
    let id = src
    // console.log(manifest)
    if(manifest[id]) {
        id = manifest[id].id
    } else {
        console.log(`\nWarning! Could not find asset ID for ${id} in assets/manifest.json`)
    }
    return id
}