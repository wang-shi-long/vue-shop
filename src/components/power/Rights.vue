<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" width="180" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限列表" min-width="180">
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="180">
        </el-table-column>
        <el-table-column prop="level" label="权限登录" min-width="180">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level==0">一级</el-tag>
            <el-tag v-else-if="scope.row.level==1" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: [],
    }
  },
  created() {
    // 获取所有权限列表
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log(res.data)
    },
  },
}
</script>

<style>
</style>