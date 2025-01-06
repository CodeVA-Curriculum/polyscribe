import fs from 'fs'
import {write, read} from 'to-vfile'
import YAML from 'yaml'

export async function uploadAssets(path) {
    // create manifest.yaml file if it doesn't already exist
    // fs.stat(path + '/manifest.yaml', function(err, stat) {
    //     if (err == null) {
    //         console.log('Found manifest.yaml!');
    //     } else if (err.code === 'ENOENT') {
    //         console.log("Did not find manifest.yaml, creating file...")
    //         write(path + '/manifest.yaml')
    //     }
    // });

    // find new assets that aren't present in manifest.yaml
    // const manifest = await YAML.parse((await read(path + '/manifest.yaml')).toString())
    // let assetFiles = []
    // fs.readdirSync(path).forEach(file => {
    //     if(file != 'manifest.yaml' && !manifest[file]) { assetFiles.push(file) }
    // });

    // upload new assets & get file IDs

    // add file IDs to manifest.yaml
}