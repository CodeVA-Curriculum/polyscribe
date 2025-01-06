import parse5 from 'parse5'
import {readSync} from 'to-vfile'
import {inspect} from 'unist-util-inspect'
import {fromParse5} from 'hast-util-from-parse5'
import {visit, SKIP} from 'unist-util-visit'
import {toHtml} from 'hast-util-to-html'
import {h} from 'hastscript'

{/* <div style="height: 300px;">
        <div style="width: auto; height: 300px; padding: 0 15px; float: right;"><img class="image-aside" style="width: 100%; height: 100%;" src="https://virtualvirginia.instructure.com/courses/18151/files/72463996/preview" alt="An automaton" data-api-endpoint="https://virtualvirginia.instructure.com/api/v1/courses/18151/files/72463996" data-api-returntype="File" /></div>
        <p><strong>Pre-1940:</strong> "Artificial intelligence" was a popular topic in fiction (even back into antiquity), and many cultures around the world attempted to produce machines that would replicate human behavior and reasoning. In this time, machines like the automaton pictured here would be regarded as "artificially intelligent". Today, the things these automata could accomplish would probably not impress many. However, in their time, their inner workings were just as opaque to most people as today's AI technologies are to today's laypeople.</p>
    </div> */}

const ImageAside = (properties, children) => {
    const src = properties.src && properties.src.includes('http') ? properties.src : `https://canvas.instructure.com/courses/18151/files/${properties.src}/preview`
    const hast = h('div', {style: 'min-height: 300px;'}, [
            h('div', {style: "width: auto; height: 300px; padding: 0 15px; float: right;"}, [ h('img', {class: "image-aside", style: "width: 100%; height: 100%;", src: src, alt: properties.alt ? properties.alt : 'No alt text provided'}) ]),
            children
        ])
    return hast
}
    

export { ImageAside }