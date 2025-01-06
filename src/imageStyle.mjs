import {visit} from 'unist-util-visit'
import { getManifest } from './upload.mjs'

export default function rehypeImageStyle() {
    return (tree) => {
        visit(tree, 'element', async function (node, index, parent) {
            if (['img'].includes(node.tagName) && (!node.properties.className || node.properties.className.length == 0)) {
                node.properties.width="100%"
                node.properties.className = ["image"]
                parent.properties.className = ["image-wrapper"]
                if(node.properties.src && !node.properties.src.includes('http')) {
                    // Get image ID from assets/manifest.yaml
                    const manifest = getManifest(global.paths.assets)
                    const id = ''
                    if(manifest[node.properties.src]) {
                        id = manifest[node.properties.src]
                    } else {
                        throw new Error(`Cannot find ${node.properties.src} in manifest.json!`)
                    }
                    node.properties.src=`https://virtualvirginia.instructure.com/courses/${global.config.id}/files/${id}/preview`
                }
            }
        })
    }
}