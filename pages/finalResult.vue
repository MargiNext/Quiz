<template>
  <v-app style="height: 100%; background:linear-gradient(#F89174, #FFC778);">
    <p :class="box" id="padding_ud_20">最終結果</p>

    <div class="colmuns">
      <div v-for="(result, index) in final_result" :key="index" id="padding_d_10">
        <div :class="select_btn" :style="pink">
          <div :class="[col, textSize]">
            <div class="column is-2 is-offset-1">
              {{ result.rank }}位
            </div>
            <div v-if='rank_count[result.rank - 1]' class="column is-6 css-fade">
              {{ result.userId }}
            </div>
            <div v-if='rank_count[result.rank - 1]' class="column is-2 css-fade">
              {{ result.correctNum }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'
import loading from '~/components/Loading.vue'
import eachResult from '~/components/eachResult.vue'

export default {
  components: {
    loading,
    eachResult
  },
  data() {
    return {
      col: 'columns',
      text_size: 'is-size-3',
      resetColor_1: '',
      resetColor_2: '',
      resetColor_3: '',
      resetColor_4: '',
      select_btn: "column is-large is-10 is-offset-1 is-outlined",
      final_result: this.$route.query,
      pink: 'background-color: #FFF0F5; color: black; border-radius: 20px;',
      color_text_1: 'background-color: #209cee; border-color: #209cee; color: #209cee;',
      color_text_2: 'background-color: #3273dc; border-color: #3273dc; color: #3273dc;',
      color_text_3: 'background-color: #00d1b2; border-color: #00d1b2; color: #00d1b2;',
      color_text_4: 'background-color: #23d160; border-color: #23d160; color: #23d160;',
			tile_class: 'column is-10-desktop is-offset-1-desktop is-size-3',
			tile_style: '',
      box: "column is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile has-text-white has-text-weight-bold",
      rank: '',
      rank_count: [false, false, false, false, false],
      countDown: 4,
    }
  },
  mounted() {
    console.log(Object.keys(this.final_result).length)
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // コンソールへ戻るためのトリガの受け取り
    this.socket.on('goScreen', result => {
			this.$router.push('/screen')
    })

    // 割合トリガの受け取り
    this.socket.on('Rank', result => {
      this.rank_count.splice(this.countDown, 1, true)
      this.countDown--
      console.log(this.rank_count)
    })
    
  },
  computed: {
    textSize: function(){
      return (Object.keys(this.final_result).length > 5) ? 'is-size-3' : 'is-size-2'
    }
  },
  watch: {
  },
}
</script>

<style scoped>
#padding_ud_20 {
  padding: 20px 0px 20px;
  font-size: 60px;
}
#padding_d_10 {
  padding: 0px 0px 10px;
}
.top {
  position: fixed;
  top: 0;
}
.css-fade{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: #FFF0F5;
}
@keyframes fade-in1 {
  0% {opacity: 0; color: black; transform: translate3d(0,-20px,0);}
  100% {opacity: 1; color: black; transform: translate3d(0,0,0);}
}
</style>