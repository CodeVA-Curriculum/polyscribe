import {visit, SKIP} from 'unist-util-visit'

// Makes the output only be a body
export default function rehypeDecapitate() {
    return (tree) => {
        visit(tree, 'element', function (node, index, parent) {
            if (['html'].includes(node.tagName)) {
                parent.children.splice(index, 1, ...node.children)
                // Do not traverse `node`, continue at the node *now* at `index`.
                return [SKIP, index]
            } else {
                return
            }
        })
        visit(tree, 'element', function (node, index, parent) {
            if (['head'].includes(node.tagName)) {
                parent.children.splice(index, 1)
                // Do not traverse `node`, continue at the node *now* at `index`.
                return [SKIP, index]
            } else {
                return
            }
        })
        visit(tree, 'doctype', function (node, index, parent) {
                parent.children.splice(index, 1)
                // Do not traverse `node`, continue at the node *now* at `index`.
                return [SKIP, index]
        })
    }
}