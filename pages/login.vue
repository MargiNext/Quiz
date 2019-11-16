<template>
  <section class="section">
      <p>ろぐいん</p>
      <div class="field">
        <label class="label">Team Name</label>
        <div class="control">
            <input class="input" type="text" placeholder="Text input" v-model="name">
        </div>
        <p v-if='isLogin' style="color: red;">※このグループ名はすでに使用済みです</p>
        <div style="padding: 20px 0 0;">
          <a class="button is-primary" @click="login()">ユーザを作成しログイン</a>
        </div>
			</div>
  </section>
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
    }
  },
  mounted() {
    this.isLogin = this.$route.query.login
    this.socket = io()
		// ログイン可否の受け取り
    this.socket.on('Login', Login => {
      this.Login.push(Login)
      this.Login.shift()
			console.log(typeof Login)
			console.log('login::' + this.Login[0])
      if(this.Login[0] == false){
        this.$router.push({path: '/login?login=true'})
      }
    })
  },
  methods: {
		login(){
      // this.socket.on('Login', login => {
      //   this.login = login
      // })
      if (this.Login) {
        console.log('ログインできそう')
      }
      else{
        console.log('ログインできなさそう')
      }
      this.$router.push('/')
      this.socket.emit('name', this.name)

			// セッションストレージを使用
			sessionStorage.setItem('name', this.name);
		}
  },
}
</script>

<style scoped>
</style>