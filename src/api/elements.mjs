import axios from "axios"
import { read } from "to-vfile"
import { getManifest } from "./upload.mjs"
import fs from 'fs'

// Supported element types
const types = {
    "page": uploadPage,
    "assignment": uploadAssignment,
    "discussion": uploadDiscussion
}

export async function uploadElements(path, elements, frontmatters) {
    const manifest = await getManifest(global.paths.root + '/modules')
    for(const element of elements) {
        const id = manifest[element]
        const frontmatter = frontmatters[element]
        const res = await types[frontmatter.type](id, element, frontmatter)
        if(res) { manifest[element] = res.data.page_id }
    }

    // Update modules/manifest.json
    try {
        fs.writeFileSync(`${global.paths.root}/modules/manifest.json`, JSON.stringify(manifest));
    } catch (err) {
        console.log(err);
    }
}

async function uploadPage(id, element, frontmatter) {
    const blob = (await read(global.paths.writeTo + '/' + element)).toString()
    const body = {
        "wiki_page[title]": frontmatter.title,
        "wiki_page[body]": blob
    }
    let res
    if(!id) {
        res = await axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/pages`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Uploaded", element)
    } else {
        res = await axios.put(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/pages/${id}`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`
        }})
        console.log("Updated", element)
    }

    return res
}

async function uploadAssignment(id, element, frontmatter) {
    console.log("Skipping assignment upload, not yet implemented...")
    return false
}

async function uploadDiscussion(id, element, frontmatter) {
    console.log("Skipping discussion upload, not yet implemented...")
    return false
}