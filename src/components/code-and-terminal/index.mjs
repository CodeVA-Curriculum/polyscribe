import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'

const CodeAndTerminal = (properties, children) => {
    const file = readSync('./src/components/code-and-terminal/index.html')
    let blob = String(file)    
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
    
    return hast
}
    

export { CodeAndTerminal }