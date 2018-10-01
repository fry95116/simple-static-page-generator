const fs = require('fs').promises
const path = require('path')
const markdownRender = require('./markdownRender')
const isNil = require('lodash.isnil')
const uslug = require('uslug')
const pug = require('pug')

const FILENAME_RC = 'markdownViewerrc.json'

async function main() {

    let config = {}
    /* read config file */
    try {
        var configString = await fs.readFile(path.join(__dirname, FILENAME_RC))
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            console.log('can not find config file on the working path!')
        }
        else console.error(err)
    }

    /* parse config file */
    try {
        config = JSON.parse(configString)
    }
    catch (err) {
        console.log('invalid config file! please check.')
    }

    /* bulid markdown files description */
    let essayDescriptions = []

    // TODO: validate path exist
    const PATH_CONTENT = path.join(__dirname, config.contentPath)
    const PATH_OUTPUT = path.join(__dirname, config.outputPath)
    const PATH_TEMPLATE = path.join(__dirname, config.templatePath)

    // scan every folder in PATH_CONTENT
    let dir = await fs.readdir(PATH_CONTENT)
    for (let className of dir) {

        let currentPath = path.join(PATH_CONTENT, className)
        let fstat = await fs.stat(currentPath)

        if (!fstat.isDirectory()) continue

        // create folder in PATH_OUTPUT if folder not exist
        let outputPath = path.join(PATH_OUTPUT, className)
        try {
            await fs.stat(outputPath)
            //TODO: check if outputPath is a directory
        }
        catch (err) {
            if (err.code === "ENOENT") {
                await fs.mkdir(outputPath)
            }
        }

        // scan every Markdown file in current folder
        let dir2 = await fs.readdir(currentPath)
        for (let fileName of dir2) {
            currentPath = path.join(currentPath, fileName)
            fstat = await fs.stat(currentPath)
            let { name, ext } = path.parse(currentPath)

            if (fstat.isFile() && ext.toLowerCase() === '.md') {
                // render process
                let str_md = await fs.readFile(currentPath)
                str_md = str_md.toString()
                let { frontMatter, body, summary, index } = markdownRender(str_md)
                // if title not exist, use file name instead
                if(isNil(frontMatter.title)) {
                    console.error(`[WARNING] title not found in front matter, use fileName instead`)
                    frontMatter.title = fstat.name
                }
                // frontMatter.title = uslug(frontMatter.title)


                // date is required
                if(isNil(frontMatter.date)){
                    console.error(`[ERROR] front matter: date required`)
                    continue
                }
                
                // let fileName = encodeURIComponent(String(frontMatter.title).trim().toLowerCase().replace(/\s+/g, '-'))
                let fileName = uslug(frontMatter.title)
                outputPath = path.join(outputPath, fileName + '.html')
                // build description
                let desc = {
                    href: `./${className}/${fileName}.html`,
                    className,
                    title: frontMatter.title,
                    createDate: frontMatter.date,
                    lastUpdateDate: fstat.mtime,
                    summary
                }
                essayDescriptions.push(desc)


                let header = `
                    <h1>${desc.title}</h1>
                    <span id="date-create">create: ${desc.createDate}</span>
                    <span id="date-last-update">lastUpdate: ${desc.lastUpdateDate}</span>
                    <hr>
                `.replace(/[ \t]+/g, ' ')

                let out = pug.renderFile(path.join(PATH_TEMPLATE, './essay.pug'),{
                    index,
                    body: header+body
                })
                fs.writeFile(outputPath, out)
                
                console.log(`[INFO] write: ${path.relative(__dirname, outputPath)}`)

                outputPath = path.join(outputPath, '../')

            }

            currentPath = path.join(currentPath, '../')
        }
    }

    /* output index file */
    // await fs.writeFile(path.join(PATH_OUTPUT, './index.json'), JSON.stringify(essayDescriptions))

    let classes = {}

    for(let essay of essayDescriptions){
        if(classes[essay.className]) classes[essay.className]++
        else classes[essay.className] = 1
    }
    
    let out = pug.renderFile(path.join(PATH_TEMPLATE, '/index.pug'), {
        classes,
        essayDescriptions
    })
    fs.writeFile(path.join(PATH_OUTPUT, './index.html'), out)

}

main()