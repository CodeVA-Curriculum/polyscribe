import axios from "axios"
import { read } from "to-vfile"
import fs from 'fs'
import { getDirectoriesInPath, getFullElementPath, processRelativePath } from "../../utils.mjs"

// Supported element types
const types = {
    "page": uploadPage,
    "assignment": uploadAssignment,
    "discussion": uploadDiscussion
}

export async function uploadElements(path, elements, frontmatters) {
    // Compare the existing manifest to the Pages on Canvas.
    // This is to check for Pages that were deleted online, but that still exist in the modules/manifest.json file.
    const manifest = global.manifest.modules
    for(const element of elements) {
        const elementID = manifest[element] ? manifest[element].id : false
        const frontmatter = frontmatters[element]
        const data = await types[frontmatter.type](elementID, element, frontmatter)
        if(data) { manifest[element] = data }
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
    return {id: res.data.page_id, url: `https://virtualvirginia.instructure.com/courses/${global.config.id}/pages/${res.data.url}` }
}

async function uploadAssignment(id, element, frontmatter) {
    const blob = (await read(global.paths.writeTo + '/' + element)).toString()
    const body = {
        "assignment[name]": frontmatter.title,
        "assignment[description]": blob,
        "assignment[points_possible]": frontmatter.points_possible? frontmatter.points_possible : 0,
        "assignment[grading_type]": frontmatter.grading_type? frontmatter.grading_type : "not_graded"
    }
    let submission_types;
    if(frontmatter.submission_types) {
        if(typeof(frontmatter.submission_types) == typeof('string')) {
            submission_types = frontmatter.submission_types
        } else {
            submission_types = [...frontmatter.submission_types]
        }
    }
    body["assignment[submission_types][]"] = submission_types

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
    return {id: res.data.id, url: res.data.html_url }
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
    // let assignmentPath = frontmatter.assignment ? frontmatter.assignment.replace('.md', '.html') : false
    // // Get the real path
    // if(assignmentPath) {
    //     assignmentPath = 
    //     assignmentPath = assignmentPath.includes('./') ? getFullElementPath(element, assignmentPath) : assignmentPath
    //     const assignment_id = global.manifest.modules[assignmentPath].id
    //     if(assignment_id) { 
    //         body.assignment_id = assignment_id
    //         console.log(`Associated discussion at ${element} with assignment with ID ${assignment_id}!`)
    //     }
    // }
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
    return { id: res.data.id, url: res.data.html_url }
}