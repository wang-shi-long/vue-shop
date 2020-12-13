<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    // 点击退出按钮
    logout() {
      // 清空token
      sessionStorage.removeItem('token')
      // 重定向到登录页
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
</style>