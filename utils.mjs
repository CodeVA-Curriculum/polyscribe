import path from 'path'
import fs from 'fs'
import axios from 'axios'
import {read, write} from 'to-vfile'
import FormData from 'form-data'
import YAML from 'yaml'
import pathUtil from 'node:path'
import { fileURLToPath } from 'url'

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

async function readYAML(path) {
    try {
        const file = await read(path)
        const obj = await YAML.parse(file.toString())
        return obj
    } catch(err) {
        console.error(err)
    }
}

function getDirectoriesInPath(path) {
    const parents = path.substring(0, path.lastIndexOf('/'))
    const folders = parents.split('/')
    let dirs = []
    let aggregate = ""
    for(const folder of folders) {
        aggregate += ("/" + folder)
        dirs.push(aggregate.substring(1))
    }
    dirs = dirs.length == 1 && dirs[0].length == 0? [] : dirs
    return dirs
}

function processRelativePath(rpath) {
    const processed = rpath.substring(2)
    return pathUtil.resolve(fileURLToPath(new URL('.', import.meta.url)), processed)
}

// Returns the path relative to `modules` of an element given its relative path
function getFullElementPath(hostPath, rpath) {
    const dirs = getDirectoriesInPath(hostPath)
    let path = rpath.replace('./', '')
    for(const dir of dirs) {
        path = dir + '/' + path
    }
    return path
}

export {getAbsolutePath, getFiles, request, getFileId, readYAML, getDirectoriesInPath, processRelativePath, getFullElementPath}