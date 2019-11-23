<template>
  <v-app style="height: 100%; background:linear-gradient(#F89174, #FFC778);">
		<div class="field" style="color: white; font-weight: bold;">
			<div class="is-mobile" id="padding_u_100">
				<p style="text-align: center; font-size: 40px;">結果発表</p>
			</div>
			<div class="is-mobile" id="padding_u_100">
				<p style="text-align: center; font-size: 20px;">スクリーンに注目してね！</p>
			</div>
		</div>
  </v-app>
</template>

<script>
import io from 'socket.io-client'

export default {
  components: {
  },
  data() {
    return {
      name: '',
      isLogin: true,
      Login: [false],
      box: 'column is-10 is-offset-1'
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    // 問題へ戻るためのトリガの受け取り
    this.socket.on('goScreen', result => {
			this.$router.push('/')
    })
  },
}
</script>

<style scoped>
#padding_u_100 {
  padding: 100px 0px 0px;
  font-family: 'Kosugi Maru', sans-serif;
}
.rot1 {
	animation: font-anime 0.8s infinite;
}
.rot1 {
	animation: font-anime 1.2s infinite alternate;
}
.rot2 {
  transform: rotate(-5deg);
}
.rot3 {
  transform: rotate(5deg);
}
@keyframes font-anime {
	0% {
    transform: rotate(-10deg);
	}
	100%{
    transform: rotate(10deg);
	}
}
</style>