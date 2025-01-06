import {visit} from 'unist-util-visit'
import { request } from '../utils.mjs'
import axios from 'axios'

export default function rehypeImageStyle() {
    return (tree) => {
        visit(tree, 'element', async function (node, index, parent) {
            if (['img'].includes(node.tagName) && (!node.properties.className || node.properties.className.length == 0)) {
                node.properties.width="100%"
                node.properties.className = ["image"]
                parent.properties.className = ["image-wrapper"]
                if(node.properties.src && !node.properties.src.includes('http')) {
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

                    // If it doesn't exist, upload it & get the ID
                    if(!found) {
                        fileInfo = {
                            name: node.properties.src,
                            parent_folder_path: 'polyscribe'
                        }
                        axios.post(`https://virtualvirginia.instructure.com/api/v1/courses/${global.config.id}/files`, fileInfo, {
                            headers: { 'Authorization': `Bearer ${global.secret}`}
                        })
                    }

                    node.properties.src=`https://virtualvirginia.instructure.com/courses/${global.config.id}/files/${node.properties.src}/preview`
                }
            }
        })
    }
}