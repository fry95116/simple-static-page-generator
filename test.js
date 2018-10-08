const os=require("os")
const http = require('http')
const path = require('path')
const open = require('open')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const generate = require('./src/generator').generate

generate(path.join(__dirname, './sample'))

var serve = serveStatic('sample/docs', {'index': ['index.html']})
 
// Create server
var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})
 
// Listen

const PORT = 8081
server.listen(PORT, ()=>{
    console.log(`listening on ${PORT}...`)
    console.log('IP: ')
    var networkInterfaces=os.networkInterfaces()
    for (let name in networkInterfaces){
        let ni = networkInterfaces[name]
        for(let info of ni){
            if(info.family === "IPv4"){
                console.log(`\t ${info.address}`)
            }
        }
    }
    
    setTimeout(()=>open(`http://localhost:${PORT}`), 500)
})

