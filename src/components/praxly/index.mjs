import { toHtml } from 'hast-util-to-html'
import {h} from 'hastscript'
import {visit} from 'unist-util-visit'

export const Praxly = (properties, children) => {
    let params = {
        editor: properties.editor? properties.editor: 'text',
        button: properties.button? properties.button: 'run',
        result: properties.result? properties.result: 'output'
    }
    const code = encodeURIComponent(toHtml(children).replace('<pre><code>', '').replace('</code></pre>', ''))
    
    const el = h('iframe', {
        src: `https://praxly.cs.jmu.edu/embed.html?editor=${params.editor}&button=${params.button}&result=${params.result}#code=${code}`,
        style: 'width:100%;height:320px;',
        class: 'praxly'
    }, children)
    return el
}