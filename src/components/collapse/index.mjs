import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'
import {fromHtml} from 'hast-util-from-html'

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
    const hast = fromHtml(blob, {fragment:true})
    
    return hast.children
}
    

export { Collapse }