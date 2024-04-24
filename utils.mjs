import path from 'path'
import fs from 'fs/promises'

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
    const entries = await fs.readdir(userPath, { withFileTypes: true });

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


export {getAbsolutePath, getFiles}