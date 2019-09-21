const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'


async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)
  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  // app.listen(port, host)
  let server = app.listen(port, host)
  console.log('Server listening on http://' + host + ':' + port) // eslint-disable-line no-console

  // WebSocketを起動する
  socketStart(server)
  console.log('Socket.IO starts')

  let quizQue = []

  function socketStart(server) {
    // Websocketサーバーインスタンスを生成する
    const io = require('socket.io').listen(server)

    // クライアントからサーバーに接続があった場合のイベントを作成
    io.on('connection', socket => {
      // 接続されたクライアントのidをコンソールに表示
      console.log('id: ' + socket.id + ' is connected')

      // サーバー側で保持しているクイズをクライアント側に送信する
      if (quizQue.length > 0) {  
        quizQue.forEach(quiz => {
          socket.emit('Question', quiz)
        })
      }

      // send
      socket.on('QuizId', quiz => {
        console.log(quiz)

        // サーバーで保持している変数にクイズidを格納する
        quizQue.push(quiz)
        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Question', quiz)

        // サーバー側で保持しているクイズidが1を超えたら古いものから削除する
        if (quizQue.length > 1) {
          quizQue = quizQue.slice(-1)
        }
      })
    })
  }
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
