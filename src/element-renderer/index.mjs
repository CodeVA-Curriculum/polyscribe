import fs from 'fs'
import {glob} from 'glob'
import { renderFile } from './renderer.mjs'
import {write} from 'to-vfile'
import { getDirectoriesInPath } from '../../utils.mjs'

export async function renderElements(readFrom, writeTo) {
    let summary = {
        rendered: [],
        numberOfFilesRendered: 0,
        assetsNotInManifest: [],
        anchorsNotInManifest: [],
        elementsNotInManifest: [],
        frontmatters: {},
        toWrite: []
    }
    let dirs = []
    // Figure out how much to render; if `path` points to a file, just build the file.
    // If it points to a directory, just render the directory.
    let files = []
    if(fs.existsSync(readFrom) && fs.lstatSync(readFrom).isDirectory()) {
        files = await glob(readFrom + "/**/*.md")
    } else if(fs.existsSync(readFrom) && fs.lstatSync(readFrom).isFile()) {
        files = [readFrom]
    } else {
        throw new Error("Cannot render elements at path " + readFrom)
    }

    

    // Render the files
    for(const file of files) {
        // Render the file
        console.log("Rendering", file)
        const {output, report, frontmatter} = await renderFile(file)

        let cleanFile =file.replace(readFrom, '').replace('.md', '.html').substring(1)
        if(!(readFrom == global.paths.root + '/modules')) {
            const append = readFrom.replace(global.paths.root + '/modules/', '')   
            cleanFile = append + "/" + cleanFile
        }

        // Create directorie(s) for new file
        const requiredDirs = getDirectoriesInPath(cleanFile)
        console.log(cleanFile, requiredDirs)
        for(const dir of requiredDirs) {
            if(!dirs.includes(dir)) {
                fs.mkdirSync(writeTo + '/' + dir)
                dirs.push(dir)
            }
        }
        
        summary.rendered.push(cleanFile)
        summary.numberOfFilesRendered++
        summary.assetsNotInManifest = [...summary.assetsNotInManifest, ...report.assetsNotInManifest]
        summary.anchorsNotInManifest = [...summary.anchorsNotInManifest, ...report.anchorsNotInManifest]
        summary.frontmatters[cleanFile] = frontmatter
        summary.toWrite = [...summary.toWrite, {
            path: writeTo + "/" + cleanFile,
            value: output.value
        }]

        await write({
            path: writeTo + '/' + cleanFile,
            value: output.value
        })
    }

    // Check `modules/manifest.json` for files that don't have IDs assigned yet & add them to the report
    const manifest = global.manifest.modules
    for(const file of summary.rendered) {
        // console.log(file)
        if(!manifest[file]) {
            summary.elementsNotInManifest.push(file)
        }
    }

    // console.log("Summary:", summary)
    return summary
}