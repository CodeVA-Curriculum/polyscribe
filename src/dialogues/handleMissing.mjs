import inquirer from 'inquirer'
import fs from 'fs'
import { uploadAssets } from '../api/upload.mjs'
import { uploadElements } from '../api/elements.mjs'

// - upload assets and re-render
// - update Canvas elements
// - update the *Modules* page

const assetHandling = [
    {
        name: "uploadAssets",
        type: "confirm",
        message: "Do you wish to upload the missing assets and add them to the manifest?",
        default: true
    }
]

const elementHandling = [
    {
        name: "uploadElements",
        type: "confirm",
        message: "Do you wish to update the course elements on Canvas using the newly rendered material?",
        default: true
    }
]

export async function handleAssets(path) {
    const response = await inquirer.prompt(assetHandling)
    if(response.uploadAssets) {
        await uploadAssets(path)
    } else {
        console.log("Warning! Missing assets will not appear properly on Canvas.\n")
    }
    return response.uploadAssets
}

export async function handleElements(path, missingElements, frontmatters) {
    const response = await inquirer.prompt(elementHandling)
    if(response.uploadElements) {
        console.log("")
        await uploadElements(path, missingElements, frontmatters)
        console.log("\nFinished!")
    } else {
        console.log("\nSkipping element upload...")
    }
    return response.uploadElements
}