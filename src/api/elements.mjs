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
        const newID = await types[frontmatter.type](id, element, frontmatter)
        if(newID) { manifest[element] = newID }
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
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Updated", element)
    }
    return res.data.page_id
}

async function uploadAssignment(id, element, frontmatter) {
    const blob = (await read(global.paths.writeTo + '/' + element)).toString()
    const body = {
        "assignment[name]": frontmatter.title,
        "assignment[description]": blob,
        "assignment[submission_types][]": frontmatter.submission_types? [...frontmatter.submission_types] : ["none"],
        "assignment[points_possible]": frontmatter.points_possible? frontmatter.points_possible : 0,
        "assignment[grading_type]": frontmatter.grading_type? frontmatter.grading_type : "not_graded"
    }
    let res
    if(!id) {
        res = await axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/assignments`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Uploaded", element)
    } else {
        res = await axios.put(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/assignments/${id}`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Updated", element)
    }
    return res.data.id
}

async function uploadDiscussion(id, element, frontmatter) {
    const blob = (await read(global.paths.writeTo + '/' + element)).toString()
    const body = {
        "title": frontmatter.title,
        "message": blob,
        "discussion_type": frontmatter.discussion_type? frontmatter.discussion_type : "threaded",
        "allow_rating": frontmatter.allow_rating? frontmatter.allow_rating : true,
        "require_initial_post": frontmatter.require_initial_post? frontmatter.require_initial_post : true
    }
    if(frontmatter.assignment) {
        body.assignment = frontmatter.assignment
    }
    let res
    if(!id) {
        res = await axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/discussion_topics`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Uploaded", element)
    } else {
        res = await axios.put(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/discussion_topics/${id}`, body, { headers: {
            "Authorization": `Bearer ${global.secret}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }})
        console.log("Updated", element)
    }
    return res.data.id
}