import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {h} from 'hastscript'


const YouTube = (properties, children) => {
    h(
        ".infobox",
        h(".infobox-title", properties.title || "Info"),
        h(".infobox-body", children)
    );
}

const removeBody = (hast) => {
    visit(hast, 'element', function (node, index, parent) {
        if (['body'].includes(node.tagName)) {
            console.log("Found <body />! Removing...")
            parent.children.splice(index, 1, ...node.children)
            // Do not traverse `node`, continue at the node *now* at `index`.
            return [SKIP, index]
        } else {
            return
        }
    })
    return hast
}

export { removeBody }