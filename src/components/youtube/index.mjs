import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {h} from 'hastscript'

const YouTube = (properties, children) => {
    // const file = readSync('./src/components/youtube/index.html')
    // const p5ast = parse5.parse(String(file), {sourceCodeLocationInfo: true})
    // const hast = fromParse5(p5ast, file)
    // <div style='text-align: center'>
    //     <iframe width="986" height="400" src="https://www.youtube.com/embed/{id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    // </div>
    const hast =    h('div', { style: "text-align: center"},
                        h('iframe', { width: "986", height: "400", src: "https://www.youtube.com/embed/{id}", title: "YouTube video player", frameborder: "0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowfullscreen: true})
                    )

    visit(hast, 'element', function (node, index, parent) {
        if (['body'].includes(node.tagName)) {
            parent.children.splice(index, 1, ...node.children)
            // Do not traverse `node`, continue at the node *now* at `index`.
            return [SKIP, index]
        } else {
            return
        }
    })
    
    // apply inputs from custom element to HTML hast tree
    visit(hast, 'element', function (node) {
        if(['iframe'].includes(node.tagName)) {
            if(!properties.id || properties.id == "") {
                throw new Error(`Please specify an ID for ::youtube components! ID not found on component with child content "${children[0].value}"\n`)
            }
            node.children = children
            node.properties.src=`https://www.youtube.com/embed/${properties.id}`
        }
    })
    return hast
}
    

export { YouTube }