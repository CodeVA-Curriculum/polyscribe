import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeDocument from 'rehype-document'
import remarkExtract from 'remark-extract-frontmatter'
import rehypeInline from 'rehype-inline'
import rehypeInjectStyles from '../injectStyles.mjs'
import rehypeDecapitate from '../decapitate.mjs'
import rehypeCanvasWrapper from '../canvasWrapper.mjs'
import rehypeFormat from 'rehype-format'
import rehypeComponents from 'rehype-components'
import rehypeWrap from 'rehype-wrap'
import yaml from 'yaml'
import {h} from 'hastscript'
import {YouTube} from '../components/youtube/index.mjs'
import {Collapse} from '../components/collapse/index.mjs'
import {Callout} from '../components/callout/index.mjs'
import {CodeExample} from '../components/code-example/index.mjs'
import {Replit} from '../components/replit/index.mjs'
import { Praxly } from '../components/praxly/index.mjs'
import rehypeImageStyle from '../imageStyle.mjs'
import remarkGfm from 'remark-gfm'
import behead from 'remark-behead'
import addClasses from 'rehype-add-classes'
import rehypePrism from 'rehype-prism-plus'
import { ImageAside } from '../components/image-aside/index.mjs'
import { getManifest } from '../api/upload.mjs'
// const YouTube = (properties, children) =>
import { fileURLToPath } from 'url';
import pathUtil from 'node:path'
  

async function renderFile(path) {
    const manifest = await getManifest(global.paths.assets)
    const report = {
        assetsNotInManifest: []
    }
    let frontmatter = { title: "No Title!" }
    console.log("Using styles at", pathUtil.resolve(fileURLToPath(new URL('.', import.meta.url)), 'main.css'))
    const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(behead, { depth: 1})
    .use(remarkExtract, {yaml:yaml.parse, name:'frontmatter'})
    .use(remarkFrontmatter, ['yaml'])
    .use(() => (tree) => {
        frontmatter = tree.children[0] && tree.children[0].value ? yaml.parse(tree.children[0].value) : {}
        // if there's no frontmatter defined but there's content in the file, the frontmatter will get assigned the first element
        if(typeof(frontmatter) == typeof('string')) {
            frontmatter = {}
        }
    })
    .use(remarkDirective)
    .use(remarkDirectiveRehype)
    .use(remarkRehype, {
        allowDangerousHtml: true
    })
    // .use(rehypeWrap, { selector: 'p img', wrapper: 'div.image-p'})
    .use(rehypeComponents, {
      components: {
            'youtube': YouTube,
            'collapse': Collapse,
            'callout': Callout,
            'code-example': CodeExample,
            'replit': Replit,
            'praxly': Praxly,
            'image-aside': ImageAside
        },
    })
    // .use(rehypeInline)
    .use(addClasses, {
      h1: 'title',
      body: 'section'
    })
    .use(rehypePrism)
    .use(rehypeDocument, {
        css: pathUtil.resolve(fileURLToPath(new URL('.', import.meta.url)), 'main.css')
    })
    .use(rehypeInline, {
        js: false,
        css: true,
        images: false,
        imports: false,
        svgElements: false,
    })
    // .use(rehypeDocument, {
    //     // css: './src/main.css'
    // })
    // .use(rehypeInline, {
    //     js: false,
    //     css: true,
    //     images: false,
    //     imports: false,
    //     svgElements: false,
    // })
    .use(rehypeImageStyle, {
        cb: (assets) => report.assetsNotInManifest = [...report.assetsNotInManifest, ...assets],
        manifest: manifest
    })
    .use(rehypeInjectStyles)
    .use(rehypeDecapitate)
    .use(rehypeCanvasWrapper)
    .use(rehypeFormat)
    .use(rehypeStringify, {
        allowDangerousHtml: true
    })
    .process(await read(path))
    return {output: html, report: report, frontmatter: frontmatter};
}

export {renderFile}
