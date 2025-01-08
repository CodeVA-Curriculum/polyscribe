import fs from 'fs'
import {glob} from 'glob'
import { renderFile } from './renderer.mjs'
import {write} from 'to-vfile'
import { getDirectoriesInPath } from '../../utils.mjs'
import { getManifest } from '../api/upload.mjs'

export async function renderElements(readFrom, writeTo) {
    let summary = {
        rendered: [],
        numberOfFilesRendered: 0,
        assetsNotInManifest: [],
        elementsNotInManifest: [],
        frontmatters: {}
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

    // Render the files to `build`
    for(const file of files) {
        // Render the file
        console.log("Rendering", file)
        const {output, report, frontmatter} = await renderFile(file)

        const cleanFile = file.replace(readFrom, '').replace('.md', '.html').substring(1)

        // Create directorie(s) for new file
        const requiredDirs = getDirectoriesInPath(cleanFile)
        for(const dir of requiredDirs) {
            if(!dirs.includes(dir)) {
                fs.mkdirSync(writeTo + '/' + dir)
                dirs.push(dir)
            }
        }


        await write({
            path: writeTo+"/"+cleanFile,
            value: output.value
        })
        summary.rendered.push(cleanFile)
        summary.numberOfFilesRendered++
        summary.assetsNotInManifest = [...summary.assetsNotInManifest, ...report.assetsNotInManifest]
        summary.frontmatters[cleanFile] = frontmatter
    }

    // Check `modules/manifest.json` for files that don't have IDs assigned yet & add them to the report
    const manifest = await getManifest(global.paths.root + '/modules')
    for(const file of summary.rendered) {
        if(!manifest[file]) {
            summary.elementsNotInManifest.push(file)
        }
    }

    return summary
}