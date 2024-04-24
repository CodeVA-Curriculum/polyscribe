import { getAbsolutePath, getFiles } from "./utils.mjs";
import inquirer from 'inquirer'
import {read} from 'to-vfile'
import {copy} from 'copy-paste'
import readline from 'readline'

main()

async function main() {
    // Get directory to loop over (recursively)
    const {directory} = await ask()
    const absDir = getAbsolutePath(directory)
    const files = (await getFiles(absDir + "/")).filter((obj) => {
        return obj.name.includes('.html')
    })

    for(const file of files) {
        const blob = (await read(file.path)).toString()
        const filename = file.path.substring(file.path.lastIndexOf('/'), file.path.length)
        const {action} = await copyFilePrompt(filename)
        if(action.toLowerCase() == 'y') {
            copy(blob)
            console.log('Copied '+filename+'!')
        } else if(action.toLowerCase() == 'n') {
            console.log('Skipping '+filename+'...')
        }
    }
    console.log("\nDone!")
}

async function ask() {
    const questions = [
        {
            name: "directory",
            type: "input",
            message: "Type the path to the folder containing the modules you'd like to copy:",
            default: "./dist"
        }
    ]
    return inquirer.prompt(questions);
}

async function copyFilePrompt(filename) {
    const questions = [
        {
            name: 'action',
            type: 'input',
            message: `Preparing to copy ${filename}. Do you want to proceed? \nType 'N' to skip, or 'Ctrl+C' to stop the program`,
            default: 'y'
        }
    ]
    return inquirer.prompt(questions)
}