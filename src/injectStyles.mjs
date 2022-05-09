import {visit} from 'unist-util-visit'
import css from 'css'

export default function rehypeInjectStyles() {
    return (tree) => {
        visit(tree, 'element', (node) => {
            if (['style'].includes(node.tagName)) {
              const cast = css.parse(node.children[0].value); // Get an AST object of the CSS
              for(const rule of cast.stylesheet.rules) {
                  for(const selector of rule.selectors) {
                        visit(tree, 'element', (node) => {
                            // Apply tag selectors to tags:
                            if(selector==node.tagName) {
                                applyStyle(rule, node)
                            }
                            if(node.properties.className) {
                                if(node.properties.className.includes(selector.substring(1, selector.length))) {
                                    // console.log(selector, node.properties.className)
                                    applyStyle(rule, node)
                                }
                            }
                        })
                  }
              }
            }
        })
    }
}

function applyTag(selector, node, rule) {
    if(selector==node.tagName) {
        applyStyle(rule, node)
      //   node.properties.style+='}'
    }
}

function applyClass(selector, node, rule) {
    if(node.properties.className.includes(selector)) {
        applyStyle(rule, node)
    }
}

function applyStyle(rule, node) {
    if (!node.properties.style) {
        node.properties.style = ""
    }
  //   node.properties.style+=`${selector}{`
    for(let i=0;i<rule.declarations.length;i++) {
        const d = rule.declarations[i]
        node.properties.style+=`${d.property}:${d.value};`
    }
}