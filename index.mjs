import fs from 'fs'
import {write, read} from 'to-vfile'
import {renderFile} from './src/element-renderer/renderer.mjs'
import inquirer from 'inquirer'
import path from "path"
import { getAbsolutePath, getFiles, readYAML } from './utils.mjs'
import * as commander from 'commander'
import { uploadAssets } from './src/api/upload.mjs'
import { renderElements } from './src/element-renderer/index.mjs'
import { deleteBuildDirDialogue } from './src/dialogues/deleteBuildDir.mjs'
import { handleAssets, handleElements } from './src/dialogues/handleMissing.mjs'

main()
const questions = [
    {
        name: "readFrom",
        type: "input",
        message: "Type the path to the folder containing your modules:",
        default: "./modules"
        // TODO: validate format
    },
    {
        name: "assetsLocation",
        type: "input",
        message: "Enter the path to the folder containing the media assets referenced in your modules:",
        default: "./assets"
    },
    {
        name: "writeTo",
        type: "input",
        message: "Type the path of the folder you would like to create to contain the newly rendered modules:",
        default: "./dist"
        // TODO: check if folder already exists, throw error if it does. Check path format
    }
]

async function ask(questions) {
    return inquirer.prompt(questions);
}

async function main() {
    const program = new commander.Command()
    
    program
        .name('polyscribe-canvas')
        .description('CLI to render Canvas modules')
        .version('0.2.1');
    
    program
        .argument('<string>')      // Location of course repo
        .option('--path <path>', 'A directory relative to the root directory containing course element files', './modules')
        .option('--build <build>', 'A directory relative to the root directory within which to build the rendered elements', './build')
        .option('--assets <assets', 'A directory containing course assets (images, etc.)', './assets')
        .option('-u')            // Whether to upload everything that was rendered automatically or to ask first
    
    program.parse()
    const options = program.opts()

    // Get paths TODO: better handling for non-standard path choices
    global.paths = {
        root: getAbsolutePath(program.args[0]),
        readFrom: getAbsolutePath(options.path.replace('./', program.args[0] + '/')),
        writeTo: getAbsolutePath(options.build.replace('./', program.args[0] + '/')),
        assets: getAbsolutePath(options.assets.replace('./', program.args[0] + '/'))
    }

    // Get configuration
    global.config = await readYAML(global.paths.root + '/config.yaml')
    const s = await readYAML(global.paths.root + '/secret.yaml')
    global.secret = s.token

    // Step 0: Validate prerequisite settings
    if(global.paths.readFrom == global.paths.writeTo) { throw new Error("The 'write' directory cannot be the same as the 'read' directory! Try again.") }

    // Generate element manifest if it doesn't exist
    if(!fs.existsSync(global.paths.root + "/modules/manifest.json")) {
        console.log("Element manifest not found, generating blank manifest...")
        try {
            fs.writeFileSync(`${global.paths.root}/modules/manifest.json`, "{}");
        } catch (err) {
            throw new Error(err)
        }
    }

    // Generate assets manifest if it doesn't exist
    if(!fs.existsSync(global.paths.root + "/assets/manifest.json")) {
        console.log("Asset manifest not found, generating blank manifest...")
        try {
            fs.writeFileSync(`${global.paths.root}/assets/manifest.json`, "{}");
        } catch (err) {
            throw new Error("Could not generate asset manifest!")
        }
    }

    // Step 1: Check to make sure the build directory doesn't already exist, then render the files specified by the selected options
    await deleteBuildDirDialogue(global.paths.writeTo)
    const renderReport = await renderElements(global.paths.readFrom, global.paths.writeTo)

    // Step 2: TODO: Check the settings in `config.yaml` to make sure everything is valid & authentication works

    // Step 3: Print a report showing:
    console.log(`\nRendered ${renderReport.numberOfFilesRendered} files to ${global.paths.writeTo}`)
    console.log(`   Found ${renderReport.assetsNotInManifest.length} assets not in assets/manifest.json`)
    console.log(`   Found ${renderReport.elementsNotInManifest.length} elements not in modules/manifest.json\n`)
    
    // Step 3: Ask user for next steps:
    await handleAssets(global.paths.assets)
    await handleElements(global.paths.writeTo, renderReport.rendered, renderReport.frontmatters)
}

// async function copyDir(src, dest) {
//     await fs.mkdir(dest, { recursive: true });
//     let entries = await fs.readdir(src, { withFileTypes: true });

//     for (let entry of entries) {
//         let srcPath = path.join(src, entry.name);
//         let destPath = path.join(dest, entry.name);

//         entry.isDirectory() ?
//             await copyDir(srcPath, destPath) :
//             await fs.copyFile(srcPath, destPath);
//     }
// }

