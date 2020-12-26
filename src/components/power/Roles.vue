<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 渲染展开的数据 -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column
          type="index"
          min-width="180"
          label="#"
        ></el-table-column>
        <el-table-column prop="roleName" label="角色名称" min-width="180">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" min-width="180">
        </el-table-column>
        <el-table-column label="操作" min-width="180">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
      >
        <!-- 把所有的权限数据以属性结构展示 -->
        <el-tree
          show-checkbox
          node-key="id"
          default-expand-all
          :data="rightslist"
          :props="treeProps"
          :default-checked-keys="defkeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表数据
      rolesList: [],
      //   是否展示分配管理的dialog
      setRightDialogVisible: false,
      //   所有权限的数据
      rightslist: [],
      //   属性控件的属性绑定对象
      /* label为属性结构展示的数据
      children为数据之间是以什么分成一二级目录的 */
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      //   默认选中的节点id值数组
      defkeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
    }
  },
  created() {
    // 所有角色的列表方法
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取所有角色列表失败')
      }
      this.rolesList = res.data
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      //   取消了删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      //   确认了删除
      const { data: res } = await this.$http.delete(
        'roles/' + role.id + '/rights/' + rightId
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      console.log(res.data)
      this.$message.success('删除权限成功')
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      //   把获取到的权限数据保存到data中
      this.rightslist = res.data
      //   递归获取三级节点的id
      this.getLeafKeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式, 获取角色下所有三级权限的id, 并保存到数组defkeys中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性
      // 则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 关闭分配权限是清空里面的选择
    setRightDialogClosed() {
      this.defkeys = []
    },
    // 点击dialog确定按钮
    async allotRights() {
      // 把dialog中所有选中和半选的树形节点的id保存到keys中
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 用逗号把keys数组的id值分割成字符串
      const idStr = keys.join(',')
      // 调用API向后端发送请求
      const { data: res } = await this.$http.post(
        'roles/' + this.roleId + '/rights',
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      // 重新刷新数据列表
      this.getRolesList()
      // 隐藏对话框
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>