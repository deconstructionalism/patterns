const crypto = require('crypto')
const fs = require('fs')
const zlib = require('zlib')


const zipFile = (readPath, writePath) => {

  const gzip = zlib.createGzip()

  const rStream = fs.createReadStream(readPath)
  const wStream = fs.createWriteStream(writePath)

  rStream
    .pipe(gzip)
    .pipe(wStream)
}


const encryptFile = (readPath, writePath, pw) => {

  return new Promise((resolve, reject) => {

      const password = new Buffer(pw)
      const aes = crypto.createCipher('aes-256-cbc',
                                      password)

      const rStream = fs.createReadStream(readPath)
      const wStream = fs.createWriteStream(writePath)

      rStream
        .pipe(aes)
        .pipe(wStream)
        .on('finish', resolve)
        .on('error', reject)
  })
}

const decryptFile = (readPath, pw) => {

  return new Promise((resolve, reject) => {

    const password = new Buffer(pw)
    const aes = crypto.createDecipher('aes-256-cbc',
                                      password)

    const rStream = fs.createReadStream(readPath)

    rStream
      .pipe(aes)
      .pipe(process.stdout)
      .on('finish', resolve)
      .on('error', reject)
  })
}

( async function() {
  zipFile('./basic-observer.js', './file.txt.gz')
  await encryptFile('./basic-observer.js', './encrypted.file', 'hello world')
  await decryptFile('./encrypted.file', 'hello world')
})()