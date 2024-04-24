import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'

let count = 0;

const Collapse = (properties, children) => {
    const file = readSync('./src/components/collapse/index.html')
    let blob = String(file)
    blob = blob.replace("{{ title }}", properties.title)
    blob = blob.replace("{{ count }}", count)
    blob = blob.replace("{{ count }}", count)
    count = count + 1;
    
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
    // visit(hast, 'element', function (node, index, parent) {
    //     if(['span'].includes(node.tagName)) {
    //         node.children[0].value = properties.title
    //     }
    // })
    // visit(hast, 'element', function (node) {
    //     if(['li'].includes())
    // })
    
    return hast
}
    

export { Collapse }