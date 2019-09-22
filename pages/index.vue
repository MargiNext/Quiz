<template>
  <section class="section">
    <div id="wrapper" class="container">
      <b-loading :is-full-page="false" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <p>{{ question.num }}.{{ question.content }}</p>
    </div>
  </section>
</template>

<script>
import io from 'socket.io-client'
import questions from '../assets/api/question.json'

export default {
  data() {
    return {
      socket: '',
      isLoading: true,
      questions: questions,
      question: '',
    }
  },
  mounted() {
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()

    this.socket.on('Question', question => {
      this.question = questions[question.id]
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
}
</script>

<style scoped>
#wrapper
{
  max-width: 600px;
}
</style>