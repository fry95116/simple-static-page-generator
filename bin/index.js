#!/usr/bin/env node
let program = require('commander');
let fs = require('fs').promises
let path = require('path')
program
    .version('0.1.0')

program
    .command('init')
    .description('initialize current path')
    .action(async function () {
        const CWD = process.cwd()
        try {
            await fs.mkdir(path.join(CWD, './content'))
            await fs.mkdir(path.join(CWD, './output'))

            await fs.mkdir(path.join(CWD, './template'))
            await fs.mkdir(path.join(CWD, './template'))
            await fs.mkdir(path.join(CWD, './template/static'))


            let text_rc = JSON.stringify({
                contentPath: './content',
                outputPath: './output',
                templatePath: './template'
            })
            await fs.writeFile(path.join(CWD, './sspgrc.json'), text_rc)
        }
        catch (err) {
            if (err.code !== 'EEXIST') throw err
        }


        // initialize folder
        //   console.log('init')
    });

program
    .command('new <filename>')
    .alias('n')
    .description('create new markdown file with essay template')
    .option("-c, --classname <classname>", "classname of the new essay")
    .action(function (filename, options) {
        console.log('create "%s" of class "%s"', filename, options.classname);
    })

program.parse(process.argv); 