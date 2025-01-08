import fs from 'fs'
import inquirer from 'inquirer'
import { getAbsolutePath, getFiles, readYAML } from './utils.mjs'
import * as commander from 'commander'
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
    }
]

async function ask(questions) {
    return inquirer.prompt(questions);
}

async function main() {
    const program = new commander.Command()
    let options = {}
    let command
    
    program
        .name('polyscribe-canvas')
        .description('CLI to render Canvas modules')
        .version('0.2.1');
    
    program.command('render')
        .description('Render course elements from a compatible course repository.')
        .argument('<string>')      // Location of course repo
        .option('--path <path>', 'A directory relative to the root directory containing course element files', './modules')
        .option('--build <build>', 'A directory relative to the root directory within which to build the rendered elements', './build')
        .option('--assets <assets', 'A directory containing course assets (images, etc.)', './assets')
        .option('-u', 'Not yet implemented')            // TODO: Whether to upload everything that was rendered automatically or to ask first
        .action(function () {
            options = this.opts()
            command = this
        })
    
    // TODO:
    // program.command('audit')
    //     .description("(Not yet implemented) Check the course repository and course elements for mistakes or issues that will lead to failed rendering.")
    
    // TODO:
    // program.command('preview')
    //     .description("Set up a development web server to preview course elements as you author them.")

    // TODO:
    // program.command('auth')
    //     .description("Test your API key to ensure you can authenticate against Canvas using polyscribe.")
    
    program.parse()
    console.log(options)

    // Get paths TODO: better handling for non-standard path choices
    global.paths = {
        root: getAbsolutePath(command.args[0]),
        readFrom: getAbsolutePath(options.path.replace('./', command.args[0] + '/')),
        writeTo: getAbsolutePath(options.build.replace('./', command.args[0] + '/')),
        assets: getAbsolutePath(options.assets.replace('./', command.args[0] + '/'))
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
    let renderReport = await renderElements(global.paths.readFrom, global.paths.writeTo)

    // Step 2: TODO: Check the settings in `config.yaml` to make sure everything is valid & authentication works

    // Step 3: Print a report showing:
    console.log(`\nRendered ${renderReport.numberOfFilesRendered} files to ${global.paths.writeTo}`)
    console.log(`   Found ${renderReport.assetsNotInManifest.length} assets not in assets/manifest.json`)
    console.log(`   Found ${renderReport.elementsNotInManifest.length} elements not in modules/manifest.json\n`)
    
    // Step 3: Ask user for next steps:
    const res = await handleAssets(global.paths.assets)
    if(res) { renderReport = await deleteBuildDirDialogue(global.paths.writeTo); await renderElements(global.paths.readFrom, global.paths.writeTo) }
    
    console.log(`\nRendered ${renderReport.numberOfFilesRendered} files to ${global.paths.writeTo}`)
    console.log(`   Found ${renderReport.assetsNotInManifest.length} assets not in assets/manifest.json`)
    console.log(`   Found ${renderReport.elementsNotInManifest.length} elements not in modules/manifest.json\n`)

    await handleElements(global.paths.writeTo, renderReport.rendered, renderReport.frontmatters)
}
