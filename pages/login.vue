<template>
  <!-- <section class="section"> -->
      <div class="field">
        <div class="is-mobile" id="padding_u_100">
          <p style="text-align: center; font-size: 30px;">SI部</p>
          <div style="text-align: center; font-size: 40px;">
            <div class="rot1">忘</div><div class="rot2">年</div><div class="rot3">会</div>
          </div>
        </div>
        <div class="columns is-mobile" id="padding_u_100">
          <div :class="box">
            <input class="input" type="text" placeholder="Team Name" v-model="name">
            <p v-if='isLogin' style="color: red;">※このグループ名はすでに使用済みです</p>
          </div>
        </div>
        <div class="columns is-mobile">
          <div :class="box">
            <a class="button is-primary" style="width: 100%;" @click="login()">ユーザを作成しログイン</a>
          </div>
        </div>
      </div>
  <!-- </section> -->
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
    this.isLogin = this.$route.query.login
    this.socket = io()
		// ログイン可否の受け取り
    this.socket.on('Login', Login => {
      this.Login.push(Login)
      this.Login.shift()
      if(this.Login[0] == false){
        this.$router.push({path: '/login?login=true'})
      }
    })
  },
  methods: {
		login(){
      this.$router.push('/')
      this.socket.emit('name', this.name)

			// セッションストレージを使用
			sessionStorage.setItem('name', this.name);
		}
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