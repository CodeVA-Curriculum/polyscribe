import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'

const CodeExample = (properties, children) => {
    const file = readSync('./polyscribe-canvas/src/components/code-example/index.html')
    let blob = String(file)
    // TODO: import course ID from CLI
    blob = blob.replace("{{ imageURL }}", `https://canvas.instructure.com/courses/13038/files/${properties.src}/preview`)
    blob = blob.replace("{{ altText }}", properties.alt)
    
    // Convert children to plaintext
    const child = toHtml(children)
    blob=blob.replace('{{ children }}', child)

    const p5ast = parse5.parse(blob, {sourceCodeLocationInfo: true})
    const hast = fromParse5(p5ast, file)

    visit(hast, 'element', function (node, index, parent) {
        if (['body'].includes(node.tagName)) {
            parent.children.splice(index, 1, ...node.children)
            // Do not traverse `node`, continue at the node *now* at `index`.
            return [SKIP, index]
        } else {
            return
        }
    })

    // add styles to 'pre' tag
    // visit(hast, 'element', function (node, index, parent) {
    //     if (['pre'].includes(node.tagName)) {
    //         const existingStyles = node.properties.style ? node.properties.style : ""
    //         node.properties.className = ['code-example-code']
    //         node.properties.style = existingStyles+"min-width: 60%; max-height: 400px; overflow: scroll; overflow-x: hidden; -webkit-column-break-inside: avoid; page-break-inside: avoid; break-inside: avoid;"
    //     }
    // })
    
    return hast
}
    

export { CodeExample }