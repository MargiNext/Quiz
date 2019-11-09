<template>
  <v-app style="height: 100%; background:linear-gradient(#F89174, #FFC778);">
    <p :class="box" id="padding_ud_50">最終結果</p>

    <div class="colmuns">
      <div v-for="(result, index) in this.final_result" :key="index" id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              {{ result.rank }}位
            </div>
            <div v-if='rank_count[result.rank - 1]' class="column is-6 css-fade">
              {{ result.userId }}
            </div>
            <div v-if='rank_count[result.rank - 1]' class="column is-2 css-fade">
              {{ result.correctNum }}
            </div>
            <!-- <div v-if='show_1 == true' class="column is-6 css-fade">
              {{ result.userId }}
            </div>
            <div v-if='show_1 == true' class="column is-2 css-fade">
              {{ result.correctNum }}
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <!-- ここから下は過去の遺産 -->
    <!-- <div class="colmuns">
      <div id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              １位．
            </div>
            <div v-if='show_1 == true' class="column is-6 css-fade">
              {{ final_result_1.userId }}
            </div>
            <div v-if='show_1 == true' class="column is-2 css-fade">
              {{ final_result_1.correctNum }}
            </div>
          </div>
        </div>
      </div>
      <div id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              ２位．
            </div>
            <div v-if='show_2 == true' class="column is-6 css-fade">
              {{ final_result_2.userId }}
            </div>
            <div v-if='show_2 == true' class="column is-2 css-fade">
              {{ final_result_2.correctNum }}
            </div>
          </div>
        </div>
      </div>
      <div id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              ３位．
            </div>
            <div v-if='show_3 == true' class="column is-6 css-fade">
              {{ final_result_3.userId }}
            </div>
            <div v-if='show_3 == true' class="column is-2 css-fade">
              {{ final_result_3.correctNum }}
            </div>
          </div>
        </div>
      </div>
      <div id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              ４位．
            </div>
            <div v-if='show_4 == true' class="column is-6 css-fade">
              {{ final_result_4.userId }}
            </div>
            <div v-if='show_4 == true' class="column is-2 css-fade">
              {{ final_result_4.correctNum }}
            </div>
          </div>
        </div>
      </div>
      <div id="padding_d_30">
        <div :class="select_btn" :style="pink">
          <div class="columns is-size-1">
            <div class="column is-2 is-offset-1">
              ５位．
            </div>
            <div v-if='show_5 == true' class="column is-6 css-fade">
              {{ final_result_5.userId }}
            </div>
            <div v-if='show_5 == true' class="column is-2 css-fade">
              {{ final_result_5.correctNum }}
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- リストレンダリングは一旦諦めました -->
    <!-- <div v-if='show_1 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">１位．{{ final_result_1.userId }} {{ final_result_1.correctNum }}</div>
    </div>
    <div v-if='show_2 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">２位．{{ final_result_2.userId }} {{ final_result_2.correctNum }}</div>
    </div>
    <div v-if='show_3 == true' class="columns css-fade2" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">３位．{{ final_result_3.userId }} {{ final_result_3.correctNum }}</div>
    </div>
    <div v-if='show_4 == true' class="columns css-fade4" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">４位．{{ final_result_4.userId }} {{ final_result_4.correctNum }}</div>
    </div>
    <div v-if='show_5 == true' class="columns css-fade5" id="padding_d_30">
      <div :style="tile_style" :class="[tile_class]">５位．{{ final_result_5.userId }} {{ final_result_5.correctNum }}</div>
    </div> -->
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
      resetColor_1: '',
      resetColor_2: '',
      resetColor_3: '',
      resetColor_4: '',
      rank_col: 'colmun',
      select_btn: "column is-large is-10 is-offset-1 is-outlined",
      final_result: this.$route.query,
      final_result_1: this.$route.query[0],
      final_result_2: this.$route.query[1],
      final_result_3: this.$route.query[2],
      final_result_4: this.$route.query[3],
      final_result_5: this.$route.query[4],
      pink: 'background-color: #FFF0F5; color: black; border-radius: 20px;',
      color_text_1: 'background-color: #209cee; border-color: #209cee; color: #209cee;',
      color_text_2: 'background-color: #3273dc; border-color: #3273dc; color: #3273dc;',
      color_text_3: 'background-color: #00d1b2; border-color: #00d1b2; color: #00d1b2;',
      color_text_4: 'background-color: #23d160; border-color: #23d160; color: #23d160;',
			tile_class: 'column is-10-desktop is-offset-1-desktop is-size-3',
			tile_style: '',
      box: "column is-8-desktop is-offset-2-desktop is-offset-1-mobile is-10-mobile has-text-white has-text-weight-bold",
      rank: '',
      // show_1: false,
      // show_2: false,
      // show_3: false,
      // show_4: false,
      // show_5: false,
      rank_count: [false, false, false, false, false],
      countDown: 4,
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
      this.rank_count.splice(this.countDown, 1, true)
      this.countDown--
      console.log(this.rank_count)
    })
    
  },
  methods: {
  },
  watch: {
  },
}
</script>

<style scoped>
#padding_ud_50 {
  padding: 50px 0px 50px;
  font-size: 80px;
}
#padding_d_30 {
  padding: 0px 0px 30px;
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