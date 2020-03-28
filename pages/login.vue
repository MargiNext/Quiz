<template>
  <!-- <section class="section"> -->
      <div class="field">
        <div class="is-mobile" id="padding_u_100">
          <!-- <p style="text-align: center; font-size: 30px;">SI部</p> -->
          <div style="text-align: center; font-size: 40px;">
            <div class="rot1">ク</div><div class="rot2">イ</div><div class="rot3">ズ</div>
          </div>
        </div>
        <div class="columns is-mobile" id="padding_u_100">
          <div :class="box">
            <input class="input" type="text" placeholder="Team Name" v-model="name">
            <input class="input" type="text" placeholder="Group ID" v-model="groupId">
            <p v-if='isLogin_name' style="color: red;">※このユーザ名はすでに使用済みです</p>
            <p v-if='isLogin_groupId' style="color: red;">※このグループIDは存在しません</p>
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
      groupId: '',
      isLogin_name: false,
      isLogin_groupId: false,
      Login: [false],
      box: 'column is-10 is-offset-1'
    }
  },
  mounted() {
    this.isLogin_name = this.$route.query.name
    this.isLogin_groupId = this.$route.query.groupId
    this.socket = io()
		// ログイン可否の受け取り
    this.socket.on('Login', Login => {
      this.Login.push(Login)
      this.Login.shift()
      console.log(this.Login)
      if(this.Login[0].name == true){
        this.$router.push({path: '/login?name=true'})
      }
      else if(this.Login[0].groupId == true){
        this.$router.push({path: '/login?groupId=true'})
      }
      else{
        console.log('無事にログインできたね！')
      }
    })
  },
  methods: {
		login(){
      let user = {
        name: this.name,
        groupId: this.groupId,
      }
      this.$router.push('/')
      this.socket.emit('user', user)

      // セッションストレージを使用
      sessionStorage.setItem('name', user.name);
      sessionStorage.setItem('groupId', user.groupId);
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