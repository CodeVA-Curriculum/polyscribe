import {visit} from 'unist-util-visit'

// const endpoints = {
//     'page': getPageURL,
//     'assignment': getAssignmentURL,
//     'discussion': getDiscussionURL 
// }

export default function auditAnchors(options) {
    return (tree) => {
        let filesNotUploaded = []
        visit(tree, 'element', async function (node, index, parent) {
            if (['a'].includes(node.tagName) && (!node.properties.className || node.properties.className.length == 0)) {
                if(node.properties.href && !node.properties.href.includes('http')) {
                    // Get file ID from modules/manifest.json
                    let src = node.properties.href.replace('.md', '.html')
                    
                    // Correct for relative path
                    if(src.substring(0,2) == './') {
                        // console.log("\nFound relative anchor element path", options.path)
                        const pathEls = options.path.split('/')
                        src = src.replace('./', pathEls[pathEls.length-2] + '/')
                        // console.log("Path corrected to " + src + "\n")
                    }

                    if(options.manifest[src]) {
                        // console.log("Found linked page in manifest!")
                        src = options.manifest[src].url
                    } else {
                        filesNotUploaded.push({url: node.properties.href, title: options.frontmatter.title})
                    }
                    node.properties.href=src
                    // console.log("node.properties.href assigned to", src)
                    // console.log('')
                }
            }
        })
        options.cb(filesNotUploaded)
    }
}