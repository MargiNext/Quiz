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

    <!-- トップバー -->
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
            <p class="title is-4">{{ this.user.name }}</p>
            <!-- <p class="subtitle is-6">score：{{ Number(this.corNum_before) }}</p> -->
            <progress class="subtitle progress is-primary is-small" :value="this.corNum_before" max="21"></progress>
          </div>
          <div class="media-right">
            <i class="fas fa-sign-out-alt fa-lg" @click="out_trigger"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 1秒間のローディング -->
    <div>
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
    </div>

    <!-- トップ画面 -->
    <!-- <div v-if="question.id == -1"> -->
    <div v-if="isTop[0]">
      <top x="1" />
    </div>

    <!-- メイン -->
    <div class="colmuns" v-else>
      <div id="padding_timer">
        <div :class="timer" class="tag is-danger">{{ timeLimit }}</div>
      </div>
      <p :class="box" id="padding_ud_30"><span style="font-weight: bold;">{{ question.num }}</span> <br> {{ question.content }}</p>
      <div id="padding_d_30">
        <button :class="select_btn" @click="answer('1')" :style="resetColor_1" onfocus="this.blur();" :disabled="isPush">{{ question.select_1 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="select_btn" @click="answer('2')" :style="resetColor_2" onfocus="this.blur();" :disabled="isPush">{{ question.select_2 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="select_btn" @click="answer('3')" :style="resetColor_3" onfocus="this.blur();" :disabled="isPush">{{ question.select_3 }}</button>
      </div>
      <div id="padding_d_30">
        <button :class="select_btn" @click="answer('4')" :style="resetColor_4" onfocus="this.blur();" :disabled="isPush">{{ question.select_4 }}</button>
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
      resetColor_1: 'background-color: transparent; border-color: #209cee; color: #209cee;',
      resetColor_2: 'background-color: transparent; border-color: #3273dc; color: #3273dc;',
      resetColor_3: 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;',
      resetColor_4: 'background-color: transparent; border-color: #23d160; color: #23d160;',
      color_1: 'is-info',
      color_2: 'is-link',
      color_3: 'is-primary',
      color_4: 'is-success',
      select_btn: "btn btn-lg column is-offset-3-desktop is-6-desktop is-offset-2-tablet is-8-tablet is-offset-1-mobile is-10-mobile",
      box: "column title is-offset-3-desktop is-6-desktop is-offset-2-tablet is-8-tablet is-offset-1-mobile is-10-mobile",
      timer: "column title is-offset-5-desktop is-2-desktop is-offset-5-tablet is-2-tablet is-offset-5-mobile is-2-mobile",
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
      showModal_result: false,
      name: '',
      corNum: 0,
      corNum_before: 0,
      ans: {
        name: '',
        groupId: '',
        ans: '',
        correct: false,
      },
      signout: false,
      isAns: false,
      timeLimit: 0,
      timeup: false,
      reload: false,
      Login: null,
      isPush: false,
      isTop: [true],
      user: '',
    }
  },
	beforeMount () {
    if(!this.$route.query.login){
			console.log(this.$route.query.login)
			this.$router.push('/login')
		}
		else {
			console.log(this.$route.query.login)
		}
  },
  created () {
  },
  mounted() {

    this.isAns = Boolean(sessionStorage.getItem('isAns'))
    this.showModal_result = Boolean(sessionStorage.getItem('showModal_result'))

    // セッションストレージから名前を取り出す
    this.user = JSON.parse(sessionStorage.getItem('user'))
    if(this.user == null){
			this.$router.push('/login')
    }

    // 最新の情報をとってくる
    this.corNum_before = sessionStorage.getItem('corNumBefore') ? sessionStorage.getItem('corNumBefore') : 0
    this.corNum = sessionStorage.getItem('corNum') ? sessionStorage.getItem('corNum') : 0

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // reconnectイベント後
    this.socket.on('connect', () => {

      if (sessionStorage.getItem('sessionId')) {
      }
      else {
        sessionStorage.setItem('sessionId', this.socket.id)
      }
      this.reload = sessionStorage.getItem('sessionId') != this.socket.id
      sessionStorage.setItem('sessionId', this.socket.id)
    });


    // 問題の受け取り
    this.socket.on('Question', question => {
      if (question.groupId == this.user.groupId) {
        if (question.id > -1) {
          this.isTop.splice(0, 1, false)
          this.question = questions[question.id]
          this.timeLimit = this.question.time
        }
        else {
          this.isTop.splice(0, 1, true)
        }
        // リロード検知
        if (this.reload) {
          this.corNum_before = sessionStorage.getItem('corNumBefore')
          this.ans.correct = Boolean(sessionStorage.getItem('ansCorrect'))
          this.timeup = sessionStorage.getItem('timeup')
          this.reload = false
        }
        // リロードでなく問題が切り替わるとき（つまり次の問題に遷移したとき）
        else {
          this.isPush = false
          sessionStorage.removeItem('isAns')
          sessionStorage.removeItem('showModal_result')
          sessionStorage.removeItem('timeup')
          if(sessionStorage.getItem('ansCorrect')) sessionStorage.removeItem('ansCorrect')
          this.isAns = false
          this.showModal_result = false
          this.corNum_before = this.corNum
          sessionStorage.setItem('corNumBefore', this.corNum_before)
          this.ans = {}
          this.timeup = false
          this.resetColor_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
          this.resetColor_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;'
          this.resetColor_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;'
          this.resetColor_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;'
        }
      }
    })

	  // 制限時間の受け取り
	  this.socket.on('timeLimit', limit => {
		  this.timeLimit = limit.time
      if (limit.groupId == this.user.groupId) {
        if (limit.time <= 0)  {
              this.timeup = true
              sessionStorage.setItem('timeup', true)
              this.isAns =false
              this.corNum_before = sessionStorage.getItem('corNumBefore') ? sessionStorage.getItem('corNumBefore') : 0
        }
      }
	  })

    // 回答トリガの受け取り
    this.socket.on('eachResult', groupId => {
      if (groupId == this.user.groupId) {
        this.showModal_result = true
        sessionStorage.setItem('showModal_result', true)
        sessionStorage.removeItem('timeup')
        this.timeup = false
        this.isAns = false
        this.corNum_before = sessionStorage.getItem('corNumBefore') ? sessionStorage.getItem('corNumBefore') : 0
      }
    })

    // 最終結果発表トリガの受け取り
    this.socket.on('finalResult', result => {
      if (result.groupId == this.user.groupId) {
        this.$router.push({ path: '/result'})
      }
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {
    answer(value){
      this.isPush = true
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
      this.ans.name = this.user.name
      this.ans.groupId = this.user.groupId
      // idと正解かどうかもサーバに送る
      this.ans.correct = (this.ans.ans == this.question.answer) ? true : false
      if (this.ans.correct) sessionStorage.setItem('ansCorrect', this.ans.correct)

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
      this.$router.push('/login')
      let info = {
        name: this.name,
        groupId: this.groupId
      }
      this.socket.emit('delName', info)
    },
  },
  // watch: {
  //   question: function(){
  //   }
  // },
}
</script>

<style scoped>
@import "https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css";
#padding_timer {
  padding: 20px 0px 0px;
}
#padding_ud_30 {
  padding: 20px 0px 20px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
}
.btn {
  white-space: normal;
}
</style>