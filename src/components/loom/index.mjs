// import parse5 from 'parse5'
// import {readSync} from 'to-vfile'
// import {inspect} from 'unist-util-inspect'
// import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'

const Loom = (properties, children) => {
    // const file = readSync('./src/components/loom/index.html')
    // const p5ast = parse5.parse(String(file), {sourceCodeLocationInfo: true})
    // const hast = fromParse5(p5ast, file)
    // <div style="text-align: center;">
    //     <iframe width="986" height="400" src="https://www.loom.com/embed/{{ id }}" title="Loom video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
    // </div>

    const hast =    ('div', {style: 'text-align: center'},
                        h('iframe', { width:"986", height:"400", src:"https://www.loom.com/embed/{{ id }}", title:"Loom video player", frameborder:"0", allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowfullscreen: true })
                    )
    
    // apply inputs from custom element to HTML hast tree
    visit(hast, 'element', function (node) {
        if(['iframe'].includes(node.tagName)) {
            if(!properties.id || properties.id == "") {
                throw new Error(`Please specify an ID for ::loom components! ID not found on component with child content "${children[0].value}"\n`)
            }
            node.children = children
            node.properties.src=`https://www.loom.com/embed/${properties.id}`
        }
    })
    return hast
}
    

export { Loom }