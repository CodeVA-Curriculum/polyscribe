import axios from 'axios'
import fs from 'fs'
import {read} from 'to-vfile'

export async function writeManifest(path, obj) {

}

export async function generateManifest(assetsPath) {
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
        info[file.filename] = {id: file.id, url: `https://virtualvirginia.instructure.com/courses/${global.config.id}/files/${file.id}/preview`}
    }

    // Write JSON object to assets/manifest.json
    try {
        fs.writeFileSync(`${global.paths.assets}/manifest.json`, JSON.stringify(info));
    } catch (err) {
        console.log(err);
    }
    return info
}

export async function getManifest(path) {
    const manifest = JSON.parse((await read(path + '/manifest.json')).toString())
    return manifest
}
