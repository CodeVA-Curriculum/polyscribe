import {h} from 'hastscript'


const Replit = (properties, children) => {
    // console.log(children)
    const hast = h('iframe.replit', {
        width: '100%',
        frameborder: "0",
        height: '500px',
        src: children[0].properties.href
    })
    return hast
}
// <iframe frameborder="0" width="100%" height="500px" src="https://repl.it/@JonStapleton1/zork-py?embed=true&outputonly=1"></iframe>

export { Replit }