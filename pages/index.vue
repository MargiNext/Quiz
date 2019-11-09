<template>
  <div>
    <!-- ローディング画面 -->
    <loading v-if="isAns" />

    <!-- 各結果を表示 -->
    <each-result v-if="showModal_re" :is_correct="this.ans.correct" />

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
      <p :class="box" id="padding_ud_30">{{ question.num }} {{ question.content }}</p>
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
import Button from '~/components/Button.vue'
import top from '~/components/Top'

export default {
  components: {
    loading,
    eachResult,
    Button,
    top
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
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
      loading: false,
      showModal: false,
      showModal_re: false,
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
    }
  },
  mounted() {
    this.isAns = Boolean(sessionStorage.getItem('isAns'));

    // セッションストレージから名前を取り出す
    this.name = sessionStorage.getItem('name');
    if(this.name == null){
			this.$router.push('/login')
    }

    // 最新の情報をとってくる
    this.corNum = sessionStorage.getItem('corNum') ? sessionStorage.getItem('corNum') : 0 ;

    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題の受け取り
    this.socket.on('Question', question => {
      this.question = questions[question.id]
    })

    // 回答トリガの受け取り
    this.socket.on('eachResult', result => {
      this.showModal_re = result
      sessionStorage.setItem('isAns', '')
      this.isAns = false
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

      // サーバー側に回答を送信する
      this.socket.emit('Answer', this.ans)

      // 正解数をセッションストレージに格納
      this.ans.correct ? this.corNum++ : this.corNum
      sessionStorage.setItem('corNum', this.corNum)

      this.loading = true
      this.showModal = true
      sessionStorage.setItem('isAns', true);
      this.isAns = true
    },
    out_trigger(){
      this.signout = true
    },
    out_cancel(){
      this.signout = false
    },
    out(){
      sessionStorage.setItem('name', null)
      sessionStorage.setItem('corNum', 0)
			this.$router.push('/login')
      this.socket.emit('delName', this.name)
    }
  },
  watch: {
    question: function(){
      this.showModal = false
      this.showModal_re = false
      this.top = (this.question.id == 0) ? true : false
      this.corNum_before = this.corNum
      this.ans = {}
      this.resetColor_1 = 'background-color: transparent; border-color: #209cee; color: #209cee;'
      this.resetColor_2 = 'background-color: transparent; border-color: #3273dc; color: #3273dc;' 
      this.resetColor_3 = 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;' 
      this.resetColor_4 = 'background-color: transparent; border-color: #23d160; color: #23d160;' 
    }
  },
}
</script>

<style scoped>
@import "https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css";
#wrapper
{
  max-width: 600px;
}
#padding_ud_30 {
  padding: 40px 0px 30px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
}
#button {
  margin: 0px 0px 30px 0px;
}
</style>