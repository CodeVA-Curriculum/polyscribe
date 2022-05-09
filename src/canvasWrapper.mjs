import {visit} from 'unist-util-visit'

const wrapperStyle = "max-width:986px;margin: 0 auto; margin-bottom: 3rem;"

export default function rehypeCanvasWrapper() {
    return (tree) => {
        visit(tree, 'element', function(node) {
            if (['body'].includes(node.tagName)) {
                node.tagName='div'
                node.properties.style=wrapperStyle
            }
        })
    }
}