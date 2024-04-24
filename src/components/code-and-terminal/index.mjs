import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'
import {fromHtml} from 'hast-util-from-html'

const CodeAndTerminal = (properties, children) => {
    const file = readSync('./src/components/code-and-terminal/index.html')
    let blob = String(file)    
    // Convert children to plaintext
    const child = toHtml(children)
    blob=blob.replace('{{ children }}', child)

    const hast = fromHtml(blob, {fragment:true})
    
    return hast.children
}
    

export { CodeAndTerminal }