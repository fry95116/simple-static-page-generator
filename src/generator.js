const path = require('path')
const markdownRender = require('./markdownRender')
const isNil = require('lodash.isnil')
const uslug = require('uslug')
const moment = require('moment')
const pug = require('pug')
const {
    readAsync,
    writeAsync,
    existsAsync,
    listAsync,
    inspectAsync,
    copyAsync,
    removeAsync
} = require('fs-jetpack')
const {mkdirAsync} = require('./utils')

async function generate(rootPath) {

    // read & validate config file
    let rcPath = path.join(rootPath, './sspgrc.json')
    let config = await readAsync(rcPath)
    if (isNil(config)) throw new Error(`missing file ${rcPath}`)
    try {
        config = JSON.parse(config)
    }
    catch (err) {
        throw new Error(`invalid json format :${rcPath}`)
    }

    if (isNil(config.contentPath) || config.contentPath === '') {
        throw new Error(`"contentPath" required in "${rcPath}"`)
    }
    if (isNil(config.outputPath) || config.outputPath === '') {
        throw new Error(`"outputPath" required in "${rcPath}"`)
    }
    if (isNil(config.templatePath) || config.templatePath === '') {
        throw new Error(`"templatePath" required in "${rcPath}"`)
    }

    /* bulid markdown files description */
    let essayDescriptions = []

    const PATH_CONTENT = path.join(rootPath, config.contentPath)
    const PATH_OUTPUT = path.join(rootPath, config.outputPath)
    const PATH_TEMPLATE = path.join(rootPath, config.templatePath)

    // validate exist of path
    if (await existsAsync(PATH_CONTENT) !== 'dir')
        throw new Error(`path: ${PATH_CONTENT} not exist`)
    if (await existsAsync(PATH_TEMPLATE) !== 'dir')
        throw new Error(`path: ${PATH_TEMPLATE} not exist`)

    //clear PATH_OUTPUT
    await removeAsync(PATH_OUTPUT)
    await mkdirAsync(PATH_OUTPUT)
    
    // scan every folder in PATH_CONTENT
    let dirs = await listAsync(PATH_CONTENT)
    for (let className of dirs) {

        let currentPath = path.join(PATH_CONTENT, className)
        if (await existsAsync(currentPath) !== 'dir') continue
        if (className === 'static'){
            console.error('[WARNING] classname static is reserved, skip...')
        }
        // scan every Markdown file in current folder
        let fileNames = await listAsync(currentPath)
        for (let fileName of fileNames) {
            let currentPath = path.join(PATH_CONTENT, className, fileName)
            let { name, ext } = path.parse(currentPath)

            if (await existsAsync(currentPath) !== 'file' || ext.toLowerCase() !== '.md') continue

            // render process
            let str_md = await readAsync(currentPath)
            let { frontMatter, body, summary, index } = markdownRender(str_md)

            if (isNil(frontMatter.title)) {
                // if title not exist, use file name instead
                console.error(`[WARNING] title not found in front matter, use fileName instead`)
                frontMatter.title = name
            }
            if (isNil(frontMatter.date)) {
                // date is required
                console.error(`[ERROR] front matter: date required, skip`)
                continue
            }
            // TODO: validate data format 'YYYY-MM-DD hh:mm'

            // let fileName = encodeURIComponent(String(frontMatter.title).trim().toLowerCase().replace(/\s+/g, '-'))
            let outputFileName = uslug(frontMatter.title) + '.html'

            let {modifyTime} = await inspectAsync(currentPath, {times: true})
            // build description
            let desc = {
                href: `./${className}/${outputFileName}`,
                className,
                title: frontMatter.title,
                createDate: frontMatter.date,
                lastUpdateDate: moment(modifyTime).format('YYYY-MM-DD hh:mm'),
                summary
            }
            essayDescriptions.push(desc)

            let header = `
                <h1>${desc.title}</h1>
                <span id="date-create">create: ${desc.createDate}</span>
                <span id="date-last-update">lastUpdate: ${desc.lastUpdateDate}</span>
                <hr>
            `.replace(/[ \t]+/g, ' ')

            let outputPath = path.join(PATH_OUTPUT, className, outputFileName)

            let essayTemplate = path.join(PATH_TEMPLATE, 'essay.pug')
            if(await existsAsync(essayTemplate) !== 'file'){
                throw new Error(`${essayTemplate} not exist`)
            }
            let out = pug.renderFile(essayTemplate, {
                index,
                body: header + body
            })
            await writeAsync(outputPath, out)

            // TODO: change log format
            console.log(`[INFO] write: ${path.relative(rootPath, outputPath)}`)

        }
    }

    /* output index file */
    let classes = {}

    for (let essay of essayDescriptions) {
        if (classes[essay.className]) classes[essay.className]++
        else classes[essay.className] = 1
    }

    let indexTemplate = path.join(PATH_TEMPLATE, 'index.pug')
    if(await existsAsync(indexTemplate) !== 'file'){
        throw new Error(`${indexTemplate} not exist`)
    }
    
    let out = pug.renderFile(indexTemplate, {
        classes,
        essayDescriptions
    })

    await writeAsync(path.join(PATH_OUTPUT, 'index.html'), out)

    /* outout static file */
    // TODO: validate existing:
    //      static/css/index.css
    //      static/css/essay.css
    //      static/js/index.js
    //      static/js/essay.js

    await copyAsync(
        path.join(PATH_TEMPLATE, 'static'),
        path.join(PATH_OUTPUT, 'static'),
        {overwrite: true}
    )
}

exports.generate = generate