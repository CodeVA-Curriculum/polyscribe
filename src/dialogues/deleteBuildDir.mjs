import inquirer from 'inquirer'
import fs from 'fs'

const questions = [
    {
        name: "delete",
        type: "confirm",
        message: "The build directory already exists! Would you like to delete it and proceed with rendering?",
        default: false
    }
]

export async function deleteBuildDirDialogue(writeTo) {
    if(!fs.existsSync(writeTo)) {
        fs.mkdirSync(writeTo)
        return
    }
    console.log("")
    const response = await inquirer.prompt(questions)
    if(response.delete) {
        fs.rmSync(writeTo, { recursive: true, force: true });
        console.log(`The build directory ${writeTo} has been deleted! Proceeding with render job...\n`)
        fs.mkdirSync(writeTo)
    } else {
        throw new Error("Cannot proceed! Build directory exists. Choose a new build directory or delete the conflicting location and try again.")
    }
}