import {visit} from 'unist-util-visit'

export default function rehypeImageStyle(options) {
    return (tree) => {
        let filesNotUploaded = []
        visit(tree, 'element', async function (node, index, parent) {
            if (['img'].includes(node.tagName) && (!node.properties.className || node.properties.className.length == 0)) {
                node.properties.width="100%"
                node.properties.className = ["image"]
                parent.properties.className = ["image-wrapper"]
                if(node.properties.src && !node.properties.src.includes('http')) {
                    // Get image ID from assets/manifest.yaml
                    let id = node.properties.src
                    // console.log("Manifest image info", options.manifest[id])
                    // if(options.manifest[id]) {
                    //     id = options.manifest[id].id
                    // } else {
                    //     filesNotUploaded.push(node.properties.src)
                    // }
                    // console.log(`Image ID for ${node.properties.src} is ${id}`)
                    // node.properties.src=`https://virtualvirginia.instructure.com/courses/${global.config.id}/files/${id}/preview`
                    node.properties.src='assets/' + node.properties.src.replace('./', '')
                    filesNotUploaded.push(node.properties.src)
                    // console.log("Updated image URL to", node.properties.src)
                }
            }
        })
        options.cb(filesNotUploaded)
    }
}