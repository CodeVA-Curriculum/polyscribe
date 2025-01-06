import path from 'path'
import fs from 'fs'
import axios from 'axios'
import {read} from 'to-vfile'
import FormData from 'form-data'

function getAbsolutePath(relativePath) {
    let absolutePath = relativePath
    if(relativePath.includes('./') || relativePath.includes('../')) {
        absolutePath = path.resolve(relativePath).replace('polyscribe-canvas/', '')
    }
    return absolutePath
}

async function getFiles(userPath) {
    const absolutePath = path.resolve(userPath)
    // console.log("Reading from", absolutePath)
    const entries = fs.readdirSync(userPath, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => ({ ...file, path: userPath + file.name }));
	
    // Get folders within the current directory
    const folders = entries.filter(folder => folder.isDirectory());

    for (const folder of folders)
        /*
          Add the found files within the subdirectory to the files array by calling the
          current function itself
        */
        files.push(...await getFiles(`${userPath}${folder.name}/`));

    return files;
}

async function request(path) {
    // axios.defaults.headers.common = {'Authorization': `Bearer ${global.secret.token}`}
    const url = "https://virtualvirginia.instructure.com/api/v1/courses/"+global.config.id
    console.log(global.secret)
    let res;
    axios.get(url + path, {
        headers: { 'Authorization': `Bearer ${global.secret}` }
    })
        .then(function (response) {
            // handle success
            // console.log(response);
            res = response
        })
        .catch(function (error) {
            // handle error
            console.log("error");
        })
    return res
}

async function getFileId() {
    // Check to see if the file exists on Canvas
    const res = await request('/files')
    let found = false
    let id = ''
    for(const file of res.data) {
        const folder = await request('/folders/' + file.folder_id)
        if(folder.name == 'polyscribe' && file.filename == node.properties.src) {
            // asset has been uploaded, use id from response in HTML
            found = true
            id = file.id
            break
        }
    }
    return id.length > 0? id : found
}

async function uploadFile(filePath) {
    // upload the file & return the File object
    let stats = fs.statSync(filePath);
    let fileSizeInBytes = stats.size;
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
    console.log(fileSizeInBytes)
    const fileInfo = {
        name: fileName,
        parent_folder_path: 'polyscribe',
        size: fileSizeInBytes
    }

    const info = await axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/files`, fileInfo, {
        headers: { 'Authorization': `Bearer ${global.secret}`}
    })
    console.log("Got upload info", info.data.upload_params)

    const uploadRes = await axios.post(info.data.upload_url, {
        ...info.data.upload_params,
        file: fs.createReadStream(filePath)
        }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    // console.log(uploadRes)
    const confirmRes = await axios.get(uploadRes.data.location, { headers : {
        "Authorization": `Bearer ${global.secret}`
    }})
    console.log(confirmRes.status)
}


export {getAbsolutePath, getFiles, request, getFileId, uploadFile}