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
          <el-button type="primary" @click="setRoleDialog">添加角色</el-button>
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
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="updateRole(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              @click="deleteRole(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
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

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      @close="closeRoleInfo"
      :visible.sync="showRoleDialog"
      width="50%"
    >
      <el-form
        :rules="addRoleInfoRules"
        ref="addRoleInfoRef"
        :model="roleInfo"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitRoleDialog">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="updateRoleDialog" width="50%">
      <el-form
        :model="updataRoleInfo"
        :rules="updataRoleRules"
        ref="updataRoleRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="updataRoleInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="updataRoleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitUpdateRoleDialog"
          >确 定</el-button
        >
      </span>
    </el-dialog>
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
      // 是否展示添加角色的对话框
      showRoleDialog: false,
      // 添加角色的信息
      roleInfo: {
        roleName: '',
        roleDesc: '',
      },
      // 编辑角色的信息
      updataRoleInfo: {},
      // 添加表单的验证规则
      addRoleInfoRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3到10个字符之间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 10,
            max: 20,
            message: '角色描述的长度在10到20个字符之间',
            trigger: 'blur',
          },
        ],
      },
      // 是否展示编辑角色的对话框
      updateRoleDialog: false,
      // 编辑表单的验证规则
      updataRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3到10个字符之间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 10,
            max: 20,
            message: '角色描述的长度在10到20个字符之间',
            trigger: 'blur',
          },
        ],
      },
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
    // 添加角色对话框的事件
    setRoleDialog() {
      this.showRoleDialog = true
    },
    // 添加角色对话框点击确定事件
    submitRoleDialog() {
      this.$refs.addRoleInfoRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.roleInfo)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 隐藏对话框
        this.showRoleDialog = false
        // 重新刷新页面
        this.getRolesList()
      })
    },
    // 关闭添加对话框的事件
    closeRoleInfo() {
      this.$refs.addRoleInfoRef.resetFields()
    },
    // 编辑角色对话框的事件
    async updateRole(id) {
      // 通过角色id查找出对应的角色信息
      // 并把角色信息添加到data中, 方便放到视图容器里
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('通过id查找角色信息失败!!!')
      }
      // 把查找出来的角色信息添加到data中
      this.updataRoleInfo = res.data
      this.updateRoleDialog = true
    },
    // 编辑角色对话框点击确定按钮的事件
    submitUpdateRoleDialog() {
      this.$refs.updataRoleRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.updataRoleInfo.roleId,
          {
            roleName: this.updataRoleInfo.roleName,
            roleDesc: this.updataRoleInfo.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 关闭对话框
        this.updateRoleDialog = false
        // 刷新数据列表
        this.getRolesList()
        this.$message.success(res.meta.msg)
      })
    },
    // 删除的点击事件
    async deleteRole(id) {
      // 弹框 判断用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否删除',
        '危险提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.info(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      // 刷新页面
      this.getRolesList()
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