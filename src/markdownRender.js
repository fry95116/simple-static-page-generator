const uslug = require('uslug')
const YAML = require('yaml')
const cheerio = require('cheerio')
const MarkdownIt = require('markdown-it')
const MarkdownItAnchor = require('markdown-it-anchor')
const MarkdownItFrontMatter = require('markdown-it-front-matter')

const LENGTH_SUMMARY = 160

function render(str_in) {
    var ret = {
        frontMatter: {},
        body: ''
    }

    render = new MarkdownIt({ html: true })
        .use(MarkdownItAnchor, {
            level: 2,
            slugify: s => uslug(s)
        })
        .use(MarkdownItFrontMatter, (fm) => {
            ret.frontMatter = YAML.parse(fm)
            return 'front Matter test'
        })

    ret.body = render.render(str_in)

    // read summary
    ret.summary = ''
    let $ = cheerio.load(ret.body)
    $('p').each((i, el) => {
        let text = $(el).text()
        if (!/^[\s]*$/.test(text) && ret.summary.length < LENGTH_SUMMARY) {
            ret.summary += text + ' '
        }
    })
    ret.summary = ret.summary.substring(0, LENGTH_SUMMARY)

    // read index
    let index = []
    $('body').children().each(function (i, el) {
        var $el = $(el)
        // capture all h2 - h6, if the first character is '!', skip it
        if (/^h[23456]$/.test(el.name)) {
            let title = $el.text().trim()
            if (title[0] === '!') return
            else index.push({
                layer: parseInt(el.name[1]),
                title: title,
                href: `#${el.attribs.id || ''}`
            })
        }
    })

    ret.index = []

    if (index.length !== 0) {
        let unit = [0]
        let initLayer = index[0].layer
        let currentLayer = initLayer
        for (let indexItem of index) {
            if (indexItem.layer === currentLayer) {
                unit[unit.length - 1]++
            }
            else if (indexItem.layer > currentLayer) {
                unit.push(1)
                currentLayer = indexItem.layer
            }
            else {
                for (let i = 0; i < currentLayer - indexItem.layer; ++i) {
                    unit.pop()
                }
                currentLayer = indexItem.layer
                unit[unit.length - 1]++
            }
            indexItem.title = unit.join('.') + ' ' + indexItem.title
            if (indexItem.layer === initLayer) {
                indexItem.children = []
                ret.index.push(indexItem)
            }
            else {
                ret.index[ret.index.length - 1].children.push(indexItem)
            }
        }
    }

    return ret
}

module.exports = render