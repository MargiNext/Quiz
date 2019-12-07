<template>
  <div>
    <!-- ローディング画面 -->
    <loading v-if="isAns" />

    <!-- 各結果を表示 -->
    <each-result v-if="showModal_result" :is_correct="this.ans.correct" />

    <!-- タイムアップ画面 -->
    <time-up v-if="timeup" />

    <!-- signoutモーダル -->
    <div :class="{ modal: true, 'is-active': signout }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">注意！</p>
        </header>
        <section class="modal-card-body">
          ログアウトしますか？
          <br>
          一度ログアウトすると戻れません．
          <!-- Content ... -->
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="out">Logout</button>
          <button class="button" @click="out_cancel">Cancel</button>
        </footer>
      </div>
    </div>

    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-left">
            <b-icon
              icon="account"
              size="is-large"
              type="is-success"
              class="colmun"
            />
          </div>
          <div class="media-content">
            <p class="title is-4">{{ name }}</p>
            <p class="subtitle is-6">score：{{ this.corNum_before }}</p>
          </div>
          <div class="media-right">
            <i class="fas fa-sign-out-alt fa-lg" @click="out_trigger"></i>
          </div>
        </div>
      </div>
    </div>
    <div>
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
    </div>
    <div v-if="top">
      <top />
    </div>
    <div class="colmuns" v-else>
    <!-- <div class="colmuns"> -->
      <div id="padding_timer">
        <div :class="timer" class="tag is-danger">{{ timeLimit }}</div>
      </div>
      <p :class="box" id="padding_ud_30"><span style="font-weight: bold;">{{ question.num }}</span> <br> {{ question.content }}</p>
      <div id="padding_d_30">
        <button :class="[select_btn, color_1]" @click="answer('1')" :style="resetColor_1" onfocus="this.blur();">{{ question.select_1 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="[select_btn, color_2]" @click="answer('2')" :style="resetColor_2" onfocus="this.blur();">{{ question.select_2 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="[select_btn, color_3]" @click="answer('3')" :style="resetColor_3" onfocus="this.blur();">{{ question.select_3 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="[select_btn, color_4]" @click="answer('4')" :style="resetColor_4" onfocus="this.blur();">{{ question.select_4 }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'
import loading from '~/components/Loading.vue'
import eachResult from '~/components/eachResult.vue'
import top from '~/components/Top'
import timeUp from '~/components/timeUp'

export default {
  components: {
    loading,
    eachResult,
    top,
    timeUp
  },
  data() {
    return {
      resetColor_1: '',
      resetColor_2: '',
      resetColor_3: '',
      resetColor_4: '',
      color_1: 'is-info',
      color_2: 'is-link',
      color_3: 'is-primary',
      color_4: 'is-success',
      select_btn: "button column is-large is-offset-3-desktop is-6-desktop is-offset-2-tablet is-8-tablet is-offset-1-mobile is-10-mobile is-outlined",
      box: "column title is-offset-3-desktop is-6-desktop is-offset-2-tablet is-8-tablet is-offset-1-mobile is-10-mobile",
      timer: "column title is-offset-5-desktop is-2-desktop is-offset-5-tablet is-2-tablet is-offset-5-mobile is-2-mobile",
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
      showModal_result: false,
      top: true,
      name: '',
      corNum: 0,
      corNum_before: 0,
      ans: {
        id: '',
        ans: '',
        correct: false,
      },
      signout: false,
      isAns: false,
      timeLimit: 0,
      timeup: false,
      reload: false,
      Login: null,
    }
  },
  created () {
  },
  mounted() {
    console.log('1')
    this.isAns = Boolean(sessionStorage.getItem('isAns'))
    this.showModal_result = Boolean(sessionStorage.getItem('showModal_result'))

    // セッションストレージから名前を取り出す
    this.name = sessionStorage.getItem('name')
    if(this.name == null){
			this.$router.push('/login')
    }

    // 最新の情報をとってくる
    this.corNum_before = sessionStorage.getItem('corNumBefore') ? sessionStorage.getItem('corNumBefore') : 0
    this.corNum = sessionStorage.getItem('corNum') ? sessionStorage.getItem('corNum') : 0

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // reconnectイベント後
    this.socket.on('connect', () => {
      console.log('2')
      console.log(this.socket.id)

      // this.socketId = sessionStorage.getItem('sessionId') ? sessionStorage.getItem('sessionId') : this.socket.id
      console.log(sessionStorage.getItem('sessionId'))
      if (sessionStorage.getItem('sessionId')) {
        console.log('すでにsocketidをセッションストレージに保存済み')
      }
      else {
        sessionStorage.setItem('sessionId', this.socket.id)
        console.log('socketidをセッションストレージに保存した')
      }
      this.reload = sessionStorage.getItem('sessionId') != this.socket.id
      console.log(this.reload)
      sessionStorage.setItem('sessionId', this.socket.id)
    });


    // 問題の受け取り
    this.socket.on('Question', question => {
      if (question.id != null) {
        console.log('3')
        sessionStorage.removeItem('showModal_result')
        this.showModal_result = false
        this.question = questions[question.id]
        this.timeLimit = this.question.time
        this.top = question.top
      }
      else {
        this.top = true
      }
      // リロード検知
      if (this.reload) {
        this.top = (this.question.id == null) ? true : false
        // this.top = (this.question.id == 0) ? true : false
        this.corNum_before = sessionStorage.getItem('corNumBefore')
        this.ans.correct = Boolean(sessionStorage.getItem('ansCorrect'))
        console.log('問題は：' + this.ans.correct)
        this.timeup = sessionStorage.getItem('timeup')
        console.log('timeup:' + sessionStorage.getItem('timeup'))
        this.reload = false
      }
      else {
        sessionStorage.removeItem('isAns')
        // sessionStorage.removeItem('showModal_result')
        sessionStorage.removeItem('timeup')
        // sessionStorage.removeItem('ansCorrect')
        this.isAns = false
        this.showModal_result = false
        this.top = (this.question.id == null) ? true : false
        // this.top = (this.question.id == 0) ? true : false
        this.corNum_before = this.corNum
        sessionStorage.setItem('corNumBefore', this.corNum_before)
        this.ans = {}
        this.timeup = false
        this.resetColor_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
        this.resetColor_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
        this.resetColor_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
        this.resetColor_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
        console.log('8')
      }
    })

	  // 制限時間の受け取り
	  this.socket.on('timeLimit', timeLimit => {
      console.log('4')
		  this.timeLimit = timeLimit
		  if (timeLimit <= 0)  {
            console.log('6')
        	  this.timeup = true
            sessionStorage.setItem('timeup', true)
            this.isAns =false
            console.log('時間終了時点でしかここは発火しないよ')
		  }
	  })

    // 回答トリガの受け取り
    this.socket.on('eachResult', result => {
      console.log('7')
      this.showModal_result = result
      sessionStorage.setItem('showModal_result', true)
      sessionStorage.removeItem('timeup')
      this.timeup = false
      this.isAns = false
    })

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', result => {
			this.$router.push({ path: '/result'})
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    answer(value){
      if (value == 1){
        this.resetColor_1 = 'background-color: #209cee; border-color: #209cee; color: #fff;'
      }
      if (value == 2){
        this.resetColor_2 = 'background-color: #3273dc; border-color: #3273dc; color: #fff;'
      }
      if (value == 3){
        this.resetColor_3 = 'background-color: #00d1b2; border-color: #00d1b2; color: #fff;'
      }
      if (value == 4){
        this.resetColor_4 = 'background-color: #23d160; border-color: #23d160; color: #fff;'
      }
      this.ans.ans = value
      // idと正解かどうかもサーバに送る
      this.ans.id = this.name
      this.ans.correct = (this.ans.ans == this.question.answer) ? true : false
      // sessionStorage.setItem('ansCorrect', false)
      sessionStorage.setItem('ansCorrect', this.ans.correct)
      console.log('結果をいれるときは(ans.cor)：' + this.ans.correct)
      console.log('結果をいれるときは：' + sessionStorage.getItem('ansCorrect'))

      // サーバー側に回答を送信する
      this.socket.emit('Answer', this.ans)

      if (this.question.id != 0){
        // 正解数をセッションストレージに格納
        this.ans.correct ? this.corNum++ : this.corNum
        sessionStorage.setItem('corNum', this.corNum)
      }

      this.loading = true
      sessionStorage.setItem('isAns', true)
      this.isAns = true
      console.log('5')
    },
    out_trigger(){
      this.signout = true
    },
    out_cancel(){
      this.signout = false
    },
    out(){
      sessionStorage.removeItem('name')
      sessionStorage.removeItem('corNum')
      sessionStorage.removeItem('corNumBefore')
      sessionStorage.removeItem('sessionId')
      console.log('sessionIdをセッションストレージから削除')
			this.$router.push('/login')
      this.socket.emit('delName', this.name)
    },
  },
  watch: {
    // question: function(){
    //   // リロード検知
    //   if (this.reload) {
    //     this.top = (this.question.id == null) ? true : false
    //     // this.top = (this.question.id == 0) ? true : false
    //     this.corNum_before = sessionStorage.getItem('corNumBefore')
    //     this.ans.correct = Boolean(sessionStorage.getItem('ansCorrect'))
    //     console.log('問題は：' + this.ans.correct)
    //     this.timeup = sessionStorage.getItem('timeup')
    //     console.log('timeup:' + sessionStorage.getItem('timeup'))
    //     this.reload = false
    //   }
    //   else {
    //     sessionStorage.removeItem('isAns')
    //     // sessionStorage.removeItem('showModal_result')
    //     sessionStorage.removeItem('timeup')
    //     // sessionStorage.removeItem('ansCorrect')
    //     this.isAns = false
    //     this.showModal_result = false
    //     this.top = (this.question.id == null) ? true : false
    //     // this.top = (this.question.id == 0) ? true : false
    //     this.corNum_before = this.corNum
    //     sessionStorage.setItem('corNumBefore', this.corNum_before)
    //     this.ans = {}
    //     this.timeup = false
    //     this.resetColor_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
    //     this.resetColor_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
    //     this.resetColor_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
    //     this.resetColor_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
    //     console.log('8')
    //   }
    // }
  },
}
</script>

<style scoped>
@import "https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css";
#wrapper
{
  max-width: 600px;
}
#padding_timer {
  padding: 20px 0px 0px;
}
#padding_ud_30 {
  padding: 20px 0px 20px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
}
#button {
  margin: 0px 0px 30px 0px;
}
</style>