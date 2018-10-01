const fs = require('fs')

function mkdirAsync(dirPath){
    return new Promise(function(resolve, reject){
        fs.mkdir(dirPath, function(err){
            if(err && err.code !== 'EEXIST') {
                reject(err)
            }
            else resolve()
        })
    })
}

exports.mkdirAsync = mkdirAsync