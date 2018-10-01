#!/usr/bin/env node
let program = require('commander');
const {copyAsync, writeAsync, readAsync, existsAsync} = require('fs-jetpack')
const path = require('path')
const moment = require('moment')
const isNil = require('lodash.isnil')
const uslug = require('uslug')
const {mkdirAsync} = require('../src/utils')
const {generate} = require('../src/generator')
let env = {
    command: null,
    options: {}
}

program
    .version('0.1.0')
    .usage('<command> [options]')
program
    .command('init')
    .alias('i')
    .description('initialize current working directory')
    .action(function(){
        env.command = 'init'
    });

program
    .command('new <title>')
    .alias('n')
    .description('create new markdown file with essay template')
    .option("-c, --classname <classname>", "classname of the new essay")
    .option("-o --overwrite", "if the file exist, it will be overwritted")
    .action(function (title, options) {
        if(isNil(options.classname)) {
            console.error('error: missing required option `-c')
            process.exit(-1)
        }

        env.command = 'new'
        env.options = {
            title: title,
            classname: options.classname,
            overwrite: options.overwrite
        }
    })

program
    .command('generate')
    .alias('g')
    .description('generate html page')
    .action(function(){
        env.command = 'generate'
    });

program.parse(process.argv); 
main(env)

async function main(env){
    if(env.command === 'init'){
        await initializeFolder(process.cwd())
    }
    else if(env.command === 'new'){
        try{
            await createEssay(
                process.cwd(),
                env.options.title,
                env.options.classname,
                env.options.overwrite
            )
        }
        catch(err){
            console.error(`ERROR: ${err.message}`)
            process.exit(-1)
        }
        // console.log('create "%s" of class "%s"', title, options.classname); 
    }
    else if(env.command === 'generate'){
        console.log('generating...')
        try{
            await generate(process.cwd())
        }
        catch(err){
            console.error(`ERROR: ${err.message}`)
            process.exit(-1)
        }
    }
    else{
        console.error('error: invalid command')
        process.exit(-1)
    }
}

/**
 * 初始化指定路径，默认设置：
 *  content(储存md文件)
 *  doc(储存html文件)
 *  template(储存模块文件)
 *  sspgrc.json(配置文件)
 * @param {string} rootPath 需要初始化的目录(绝对路径)
 */
async function initializeFolder(rootPath){

    await mkdirAsync(path.join(rootPath, './content'))
    // await mkdirAsync(path.join(rootPath, './docs'))

    await copyAsync(
        path.join(__dirname, '../defaultTemplate'),
        path.join(rootPath, './template'),
        {overwrite: true}
    )

    let text_rc = JSON.stringify({
        contentPath: './content',
        outputPath: './docs',
        templatePath: './template'
    })
    await writeAsync(path.join(rootPath, './sspgrc.json'), text_rc)
}

/**
 * 创建新文章
 * @param {string} rootPath 已经初始化的路径（绝对路径，必须包含sspgrc.json）
 * @param {string} title 文章标题
 * @param {string} className 文章所属的大类
 * @param {boolean} overwrite 如果文件存在，是否覆盖原文件
 */
async function createEssay(rootPath, title, className, overwrite){
    if(className === 'static') throw new Error('class name "static" is reserved')
    let rcPath = path.join(rootPath, './sspgrc.json')
    let config = await readAsync(rcPath,)
    if(isNil(config)) throw new Error(`missing file ${rcPath}`)
    try{
        config = JSON.parse(config)
    }
    catch(err){
        throw new Error(`invalid json format :${rcPath}`)
    }

    if(isNil(config.contentPath) || config.contentPath === ''){
        throw new Error(`"contentPath" required in "${rcPath}"`)
    }

    let filePath = path.join(config.contentPath, className, uslug(title) + '.md')
    
    if(!overwrite && await existsAsync(filePath)){
        throw new Error(`${filePath} already exist`)
    }
    
    let frontMatter = '' + 
    '---\n' +
    `title: ${title}\n` +
    `date: ${moment().format('YYYY-MM-DD hh:mm')}\n` +
    '---\n'

    await writeAsync(filePath, frontMatter)
}

