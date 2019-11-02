<template>
  <div>
    <p :class="box" id="padding_ud_30">結果</p>
    <div v-if='show_1 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">hoge</div>
    </div>
    <div v-if='show_2 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">huga</div>
    </div>
    <div v-if='show_3 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">huga</div>
    </div>
    <div v-if='show_4 == true' class="columns css-fade4" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">huga</div>
    </div>
    <div v-if='show_5 == true' class="columns css-fade5" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">huga</div>
    </div>
  </div>
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
      color_1: 'background-color: transparent; border-color: #209cee; color: #209cee;',
      color_2: 'background-color: transparent; border-color: #3273dc; color: #3273dc;',
      color_3: 'background-color: transparent; border-color: #00d1b2; color: #00d1b2;',
      color_4: 'background-color: transparent; border-color: #23d160; color: #23d160;',
      color_text_1: 'background-color: #209cee; border-color: #209cee; color: #209cee;',
      color_text_2: 'background-color: #3273dc; border-color: #3273dc; color: #3273dc;',
      color_text_3: 'background-color: #00d1b2; border-color: #00d1b2; color: #00d1b2;',
      color_text_4: 'background-color: #23d160; border-color: #23d160; color: #23d160;',
			tile_class: 'column is-8-desktop is-offset-2-desktop is-size-3',
			tile_style: 'height: 100px;',
      box: "column is-size-3 is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile",
      rank: '',
      show_1: false,
      show_2: false,
      show_3: false,
      show_4: false,
      show_5: false,
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // コンソールへ戻るためのトリガの受け取り
    this.socket.on('goScreen', result => {
			this.$router.push('/screen')
    })

    // 割合トリガの受け取り
    this.socket.on('Rank', result => {
      this.rank = result
      console.log(this.rank)

      // 順位を受け取ったら変数に格納
      if (this.rank == '1') {
        this.show_1 = true
      }
      if (this.rank == '2') {
        this.show_2 = true
      }
      if (this.rank == '3') {
        this.show_3 = true
      }
      if (this.rank == '4') {
        this.show_4 = true
      }
      if (this.rank == '5') {
        this.show_5 = true
      }
    })
    
  },
  methods: {
  },
  watch: {
  },
}
</script>

<style scoped>
#padding_ud_30 {
  padding: 40px 0px 30px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
}
.css-fade1{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: white;
}
.css-fade2{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: white;
}
.css-fade3{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: white;
}
.css-fade4{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: white;
}
.css-fade5{
  animation-name:fade-in1;
  animation-duration:2s;
  animation-timing-function: ease-out;
  animation-delay:1s;
  animation-iteration-count:1;
  animation-direction:normal;
  animation-fill-mode: forwards;
  color: white;
}
@keyframes fade-in1 {
  0% {opacity: 0; color: black; transform: translate3d(0,-20px,0);}
  100% {opacity: 1; color: black; transform: translate3d(0,0,0);}
}
</style>