const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const firebase = require('firebase')
const serviceAccount = require('../serviceAccoundKey.json') // import account info
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

// Initialize firestore
firebase.initializeApp({ ...serviceAccount })
const db = firebase.firestore()
const settings = { timestampsInSnapshots: true }
db.settings(settings)

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

  let quizId = 0 // クイズの問題番号
  let ansSelect = [] // 回答数
  let finalResult = [] // 最終結果時のデータ
  let userResult = {} // ユーザごとの正答数
  let rank = 5

  function socketStart(server) {
    // Websocketサーバーインスタンスを生成する
    const io = require('socket.io').listen(server)

    // クライアントからサーバーに接続があった場合のイベントを作成
    io.on('connection', socket => {
      // 接続されたクライアントのidをコンソールに表示
      console.log('id: ' + socket.id + ' is connected')

      // サーバー側で保持しているクイズをクライアント側に送信
      if (quizId != 0) {
          socket.emit('Question', quizId)
      }

      // 問題の受け取り
      socket.on('QuizId', quiz => {
        console.log(quiz)

        // サーバーで保持している変数にクイズidを格納する
        quizId = quiz

        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Question', quiz)
      })

      // トリガ（rateResult）の受け取り，クライアントへ送信
      socket.on('rateResult', result => {
        // データベースから回答割合を算出する
        // TODO: 初回にボタンを押したときに反応しない = ansSelectに値が入らない => 変数初期化関連？
        // TODO: firestoreからデータを取り出す時点でquizIdに合わせて取ってくる => .where()を利用？
        db.collection("quiz").get().then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            // 現在の問題番号に絞り込む
            if (doc.data().quiz_id == quizId.id) {
              ansSelect.push(doc.data().select_num)
            }
          })
        })
        // エラー処理
        .catch(function(error) {
          console.log("Error getting documents: ", error)
        })

        console.log("ansSelect: ", ansSelect)
        let counts = {}
        for(let i=0;i< ansSelect.length;i++)
        {
          let key = ansSelect[i]
          counts[key] = (counts[key])? counts[key] + 1 : 1
        }
        console.log("counts: ", counts)

        // 回答割合の送信
        socket.broadcast.emit('rateResult', counts)

        // ansSelectの初期化
        ansSelect = []
      })

      // トリガ（eachResult）の受け取り，クライアントへ送信
      socket.on('eachResult', result => {
        socket.broadcast.emit('eachResult', result)
      })

      // トリガ（finalResult）の受け取り，クライアントへ送信
      socket.on('finalResult', result => {
        // データベースから結果を算出する
        // TODO: 初回にボタンを押したときに反応しない = finalResultに値が入らない => 変数初期化関連？
        db.collection("quiz").get().then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            finalResult.push(doc.data())
            if (!userResult[doc.data().user_id]) {
              userResult[doc.data().user_id] = 0
            }
          })
        })
        // エラー処理
        .catch(function(error) {
          console.log("Error getting documents: ", error)
        })
        // ユーザごとに正答数をカウントする
        for(let i=0;i< finalResult.length;i++)
        {
          user_ = finalResult[i].user_id
          is_correct = finalResult[i].is_correct
          if (is_correct) {
            userResult[user_]++
          }
        }
        let userRank = [] // 連想配列に変換してソートする
        for (let i in userResult) {
          userRank.push({
            "userId": i,
            "correctNum": userResult[i]
          })
        }
        // 正答数順にソートする
        userRank.sort(function(a,b){
          if(a.correctNum>b.correctNum) return -1
          if(a.correctNum < b.correctNum) return 1
          return 0
        })
        // for debug
        console.log(userRank)

        // 正答数をscreenに送信
        // 上位のみ送信
        socket.broadcast.emit('finalResult', userRank.slice(0,rank))
        // 値の初期化
        finalResult = []
        userResult = {}
      })

      // トリガ（goScreen）の受け取り，クライアントへ送信
      socket.on('goScreen', go => {
        socket.broadcast.emit('goScreen', go)
      })

      // 回答の受け取り
      socket.on('Answer', ans => {
        console.log('receive')
        console.log(ans)

        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Answer', ans)

        // dbに格納
        db.collection("quiz").add({
          user_id: ans.id,
          quiz_id: quizId.id,
          select_num: ans.ans,
          is_correct: ans.correct
        })
        .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });

      })
    })
  }
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
