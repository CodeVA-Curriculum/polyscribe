import fs from 'fs'
import {read} from 'to-vfile'
import axios from 'axios'

export async function uploadAssets(path) {
    // Find all files in `assets`
    let assetFiles = []
    fs.readdirSync(path).forEach(file => {
        if(file != 'manifest.json') { assetFiles.push(path + '/' + file) }
    });

    // upload all assets to `polyscribe` folder in course
    for(const file of assetFiles) {
        await uploadFile(file)
    }

    // generate assets/manifest.json
    await generateManifest(path)
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

export async function getManifest(assetsPath) {
    const manifest = JSON.parse((await read(assetsPath + '/manifest.json')).toString())
    return manifest
}

async function generateManifest(assetsPath) {
    // Find `polyscribe folder ID`
    const res = await axios.get(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/folders`, { headers: {
        "Authorization": `Bearer ${global.secret}`
    }})
    let folderId = '';
    let filesURL = ''
    let found = false
    for(const folder of res.data) {
        if(folder.name == 'polyscribe') {
            folderId = folder.id
            filesURL = folder.files_url
            found = true
        }
    }
    if(!found) { throw new Error("Could not find folder with name 'polyscribe' in course!")}

    // Get all files in the `polyscribe` folder
    const files = (await axios.get(filesURL, { headers: {
        "Authorization": `Bearer ${global.secret}`
    }})).data

    // Create JSON object with file info
    let info = {}
    for(const file of files) {
        info[file.filename] = file.id
    }

    // Write JSON object to assets/manifest.json
    try {
        fs.writeFileSync(`${global.paths.assets}/manifest.json`, JSON.stringify(info));
    } catch (err) {
        console.log(err);
    }
}