const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const firebase = require('firebase')
const serviceAccount = require('../serviceAccountKey.json') // import account info
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

  let quizId = new Map() // クイズの問題番号
  let maxQuizNum = 21 // クイズの問題数
  let maxAnsNum = 4 // クイズの選択肢数
  let people = new Map() // 参加人数

  let ansSelect = new Map() // 回答数
  let ansUser = new Map() // 回答ユーザ

  let finalResult = new Map() // 最終結果時のデータ
  let userResult = new Map() // ユーザごとの正答数
  let rank = 10 // 上位表彰者数
  let winner = new Map() // 上位入賞者

  let timeLimit = new Map() // 残り回答時間

  let rateResultButtonFlag = new Map() // 回答割合表示ボタンが起動しているか判断するフラグ

  let observer = db.collection('user') // userデータベース

  // user数カウントの初期化
  db.collection('admin').get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      people[doc.data().groupId] = 0
    })
  })

  // userデータベースの監視
  observer.onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
      let groupId = change.doc.data()['groupId']
      let name = change.doc.data()['name']
      console.log(groupId)
      console.log(name)
      if (change.type === 'added') {
        console.log('New name: ', name);
        people[groupId]++
      }
      if (change.type === 'modified') {
        console.log('Modified name: ', name);
        let numIndex = array.lastIndexOf(name)
      }
      if (change.type === 'removed') {
        console.log('Removed name: ', name);
      }
      console.log('people_num:' , people[groupId], ', groupId: ', groupId)
    })
  })

  function socketStart(server) {
    // Websocketサーバーインスタンスを生成する
    const io = require('socket.io').listen(server)

    // クライアントからサーバーに接続があった場合のイベントを作成
    io.on('connection', socket => {
      // 接続されたクライアントのidをコンソールに表示
      console.log('id: ' + socket.id + ' is connected')

      // for debug: websocketの確認
      var clients = io.sockets.clients()
      console.log('socket count: ', clients.server.engine.clientsCount)
      // console.log(clients.adapter.rooms)

      // サーバー側で保持している参加人数をクライアント側に送信
      db.collection('admin').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          let groupId = doc.data().groupId
          socket.broadcast.emit('People', {'people_num': people[groupId], 'groupId':groupId})
        })
      })

      // 問題の受け取り
      socket.on('QuizId', quiz => {
        console.log(quiz)

        // for debug: websocketの確認
        console.log('socket count: ', clients.server.engine.clientsCount)

        // サーバーで保持している変数にクイズidを格納する
        quizId[quiz.groupId] = quiz.id

        // サーバーで保持している変数にクイズの制限時間を格納する
        timeLimit[quiz.groupId] = quiz.time

        // クライアントに対してクイズidを送信する
        socket.broadcast.emit('Question', quiz)
      })

      // トリガ（rateResult）の受け取り，クライアントへ送信
      socket.on('rateResult', groupId => {
        if (rateResultButtonFlag.has(groupId) == false) rateResultButtonFlag[groupId] = true
        if (ansSelect.has(groupId) == false) ansSelect[groupId] = []
        if (ansUser.has(groupId) == false) ansUser[groupId] = []
        if (rateResultButtonFlag[groupId]) {
          rateResultButtonFlag = false
          console.log("quiz: ", quizId[groupId])
          // データベースから回答割合を算出する
          function dbResult() {
            return new Promise(function(resolve,reject) {
              db.collection(String(groupId+'_'+quizId[groupId])).get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    ansSelect[groupId].push(doc.data().select_num)
                    ansUser[groupId].push(doc.data().user_id)
                })
              })
              // エラー処理
              .catch(function(error) {
                console.log("Error getting documents: ", error)
              })
              setTimeout(function() {
                resolve(1);
              }, 1000)
            })
          }
          dbResult().then(function(value) {
            // 回答者数
            console.log("ans num: ", ansSelect[groupId].length)
            // 回答選択肢リスト
            console.log("ansSelect: ", ansSelect[groupId])
            let counts = {}
            for(let i=0;i< ansSelect[groupId].length;i++)
            {
              let key = ansSelect[groupId][i]
              counts[key] = (counts[key])? counts[key] + 1 : 1
            }
            // 回答者がいない選択肢に0を代入する
            for(let i = 1;i <= maxAnsNum;i++) {
              if (!counts[String(i)]) counts[String(i)] = 0
            }
            console.log("counts: ", counts)

            // 回答割合の送信
            socket.broadcast.emit('rateResult', {'counts': counts, 'groupId': groupId})

            // 値の初期化
            ansSelect[groupId] = []
            ansUser[groupId] = []
            rateResultButtonFlag[groupId] = true
          })
        }
      })

      // トリガ（eachResult）の受け取り，クライアントへ送信
      socket.on('eachResult', result => {
        socket.broadcast.emit('eachResult', result)
      })

      // トリガ（finalResult）の受け取り，クライアントへ送信
      socket.on('finalResult', groupId => {
        if (finalResult.has(groupId) == false) finalResult[groupId] = []
        if (userResult.has(groupId) == false) userResult[groupId] = {}
        if (winner.has(groupId) == false) winner[groupId] = []
        // データベースから結果を算出する
        function dbResult() {
          return new Promise(function(resolve,reject) {
            for(let i=1;i<=maxQuizNum;i++) {
              db.collection(groupId+'_'+String(i)).get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                  finalResult[groupId].push(doc.data())
                  if (!userResult[groupId][doc.data().user_id]) {
                    userResult[groupId][doc.data().user_id] = 0
                  }
                })
              })
              // エラー処理
              .catch(function(error) {
                console.log("Error getting documents: ", error)
              })
            }
            setTimeout(function() {
              resolve(1);
            }, 1000)
          })
        }
        dbResult().then(function(value) {
          // ユーザごとに正答数をカウントする
          for(let i=0;i < finalResult[groupId].length;i++)
          {
            user_ = finalResult[groupId][i].user_id
            is_correct = finalResult[groupId][i].is_correct
            if (is_correct) {
              userResult[groupId][user_]++
            }
          }
          let userRank = [] // 連想配列に変換してソートする
          for (let i in userResult[groupId]) {
            userRank.push({
              "userId": i,
              "correctNum": userResult[groupId][i],
            })
          }
          // 正答数順にソートする
          userRank.sort(function(a,b){
            if(a.correctNum>b.correctNum) return -1
            if(a.correctNum < b.correctNum) return 1
            return 0
          })
          // for debug
          // console.log(userRank)

          // 正答数をscreenに送信
          // 上位のみ送信
          let in_rank = 1
          let plus_rank = 0
          for (let i=0;i < userRank.length;i++) {
            if (winner[groupId].length >= rank) break
            // 順位を格納する
            userRank[i].rank = in_rank
            winner[groupId].push(userRank[i])
            plus_rank = 0
            for (let j=i+1;j < userRank.length;j++){
              if (userRank[i].correctNum > userRank[j].correctNum) break
              // 順位を格納する
              userRank[j].rank = in_rank
              winner[groupId].push(userRank[j])
              i++
              plus_rank++
            }
            plus_rank++
            in_rank += plus_rank
          }
          console.log(winner[groupId])
          io.to(socket.id).emit('finalResult', {'rank':winner[groupId], 'groupId': groupId})
          socket.broadcast.emit('finalResult', {'rank':winner[groupId], 'groupId': groupId})
          // 値の初期化
          finalResult[groupId] = []
          userResult[groupId] = {}
          winner[groupId] = []
        })
      })

      // トリガ（goScreen）の受け取り，クライアントへ送信
      socket.on('goScreen', go => {
        socket.broadcast.emit('goScreen', go)
      })

      // トリガ（goScreen）の受け取り，クライアントへ送信
      socket.on('Rank', go => {
        socket.broadcast.emit('Rank', go)
      })

      // トリガ（timeLimit）の受け取り，クライアントへ送信
      socket.on('timeLimit', groupId => {
        let date = new Date()
        date = date.setTime(date.getTime() + 1000*60*60*9)
        socket.broadcast.emit('timeLimit', {'date':date, 'groupId':groupId})
      })

      // 回答の受け取り
      socket.on('Answer', ans => {
        console.log('receive')
        console.log(ans)
        // DBに格納
        db.collection(String(ans.groupId+'_'+quizId[ans.groupId])).add({
          user_id: ans.name,
          groupId: ans.groupId,
          select_num: ans.ans,
          is_correct: ans.correct
        })
        .then(function() {
          console.log("Document successfully written!")
        })
        .catch(function(error) {
          console.error("Error writing document: ", error)
        })

      })

      // 管理者登録時のgroupIdの受け取り
      socket.on('admin', admin => {
        // for debug
        console.log(admin)
        // DBにadmin情報を登録
        db.collection('admin').add({
          name: admin.name,
          groupId: admin.groupId
        })
        .then(function() {
          console.log("Document successfully written!")
        })
        .catch(function(error) {
          console.error("Error writing document: ", error)
        })
      })

      // userの受け取り，クライアントへ送信
      socket.on('user', user => {
        let error_check = {
          name: false,
          groupId: false
        }
        // for debug
        console.log(user)
        adminDB = db.collection('admin').where('groupId','==',user.groupId)
        adminDB.get().then(function(querySnapshot) {
          // groupIDが存在しない場合
          if (querySnapshot.empty) {
            console.log("Not Exist groupId")
            // ログインの失敗をクライアントに送信
            error_check.groupId = true
            io.to(socket.id).emit('Login', error_check)
          } else {
            console.log("Exist groupId")
            db.collection('user').where('groupId','==',user.groupId).where('name','==',user.name).get()
            .then(function(querySnapshot) {
              // 同一グループ内でユーザ名が重複しなかったため新しくDBに格納する
              if (querySnapshot.empty) {
                console.log(user)
                console.log("Not Exist user name")
                db.collection('user').add({
                  name: user.name,
                  groupId: user.groupId
                })
                // ログインの成功をクライアントに送信
                io.to(socket.id).emit('Login', error_check)
                // ログイン時のSocketを解放
                io.sockets.connected[socket.id].disconnect()
                console.log('login socket id: ', socket.id, 'disconnected')
                // 実際の人数の追加は後で行われる（リアルタイムベースによる更新時）
              } else { // 既にユーザが登録されているため登録し直し
                console.log("Exist user name")
                // ログインの失敗をクライアントに送信
                error_check.name = true
                io.to(socket.id).emit('Login', error_check)
              }
            })
          }
        })
      })

      // screen groupIdの受け取り
      socket.on('screen', groupId => {
        // for debug
        console.log(groupId)
        adminDB = db.collection('admin').where('groupId','==',groupId)
        adminDB.get().then(function(querySnapshot) {
          // groupIDが存在しない場合
          if (querySnapshot.empty) {
            console.log("Not Exist groupId")
            // ログインの失敗をクライアントに送信
            io.to(socket.id).emit('screenLogin', true)
          } else {
            console.log("Exist groupId")
            // ログインの成功をクライアントに送信
            io.to(socket.id).emit('screenLogin', false)
          }
        })
      })

      // delNameの受け取り，クライアントへ送信
      socket.on('delName', result => {
        // userをDBから削除
        db.collection('user').where('groupId','==',result.groupId).where('name','==',result.name).get()
        .then(doc => {
          db.collection('user').doc(doc.docs[0].id).delete()
          .catch(function(error) {
            console.log('Error delete (groupId, name): (', result.groupId, ', ',result.name, ')')
          })
        })
        // 実際の人数減少は後で行われる（リアルタイムベースによる更新時）
        socket.broadcast.emit('People', {'people_num': people[result.groupId]--, 'groupId':result.groupId})
      })

      // Top画面のSocketを解放
      socket.on('TopSocketId', topSocketId => {
        console.log('top socket id: ', topSocketId, 'disconnected')
        io.sockets.connected[topSocketId].disconnect()
      })
    })
  }
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
