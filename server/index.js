const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const firebase = require('firebase')
const serviceAccount = require('../serviceAccoundKey.json') // import account info
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

// firestore
firebase.initializeApp({ ...serviceAccount })
const db = firebase.firestore()
const settings = { timestampsInSnapshots: true }
db.settings(settings)

// db -> express
// db.collection("test").get().then((querySnapshot) => {
//   querySnapshot.forEach((doc) => {
//     console.log(doc.id, '=>', doc.data())
//   })
// })

// express -> db
// db.collection("test").add({
//   first: "kuma",
//   last: "aioue",
//   born: 1815
// })
// .then(function(docRef) {
//   console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//   console.error("Error adding document: ", error);
// });


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

  let quizId = []
  let ansQueue = []

  function socketStart(server) {
    // Websocketサーバーインスタンスを生成する
    const io = require('socket.io').listen(server)

    // クライアントからサーバーに接続があった場合のイベントを作成
    io.on('connection', socket => {
      // 接続されたクライアントのidをコンソールに表示
      console.log('id: ' + socket.id + ' is connected')

      // サーバー側で保持しているクイズをクライアント側に送信
      if (quizId.length > 0) {
        quizId.forEach(quiz => {
          socket.emit('Question', quiz)
        })
      }

      // サーバーで保持している回答をクライアント側に送信
      if (ansQueue.length > 0) {
        ansQueue.forEach(answer => {
          socket.emit('Answer', answer)
        })
      }

      // 問題の受け取り
      socket.on('QuizId', quiz => {
        console.log(quiz)

        // サーバーで保持している変数にクイズidを格納する
        quizId.push(quiz)

        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Question', quiz)
      })

      // 回答の受け取り
      socket.on('Answer', ans => {
        console.log(ans)

        // 一旦socket idを回答に紐付けておきました
        ans.id = socket.id

        // サーバーで保持している変数にクイズidを格納する
        ansQueue.push(ans)
        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Answer', ans)

        // サーバー側で保持している回答が1を超えたら古いものから削除する
        if (ansQueue.length > 10) {
          ansQueue = ansQueue.slice(-10)
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
