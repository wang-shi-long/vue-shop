<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 点击添加按钮 -->
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        index-text="#"
        :data="catelist"
        :columns="columns"
        class="treeTable"
      >
        <!-- 是否有效的模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            style="color: lightgreen"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: lightgreen" class="el-icon-error" v-else></i>
        </template>
        <!-- 排序的模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            type="success"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作的模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            @click="editCate(scope.row)"
            type="primary"
            size="mini"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button
            @click="deleteCate(scope.row.cat_id)"
            type="danger"
            size="mini"
            icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <!-- size-change为每页数据多少改变时触发
      current-change为改变页数时触发
      current-page为当前的页数
      page-sizes为每页有几条数据分类
      page-size为每页有多少条数据
      total为总条数 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源的 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: true,
            }"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateInfo"
        ref="editCateRef"
        :rules="editCateRules"
        label-width="80px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateInfo.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询商品分类数据的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表
      catelist: [],
      //   商品总数
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //   表示将当前列定义为模板列
          type: 'template',
          //   当前这一列使用的模板名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '分类名称',
          type: 'template',
          template: 'opt',
        },
      ],
      //   控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //   添加分类的表单数据对象
      addCateForm: {
        cat_name: '',
        // 分类的登录, 默认为一级分类
        cat_level: 0,
        cat_pid: 0,
      },
      //   添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的父级分类的数组
      selectedKeys: [],
      // 编辑分类是否显示
      editCateDialogVisible: false,
      // 编辑分类的对象
      editCateInfo: {},
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // 改变了pagesize的大小
      this.querInfo.pagesize = newSize
      //   立即发送数据请求
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加按钮, 展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 在打开对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    // 级联选择器发生变化触发这个事件
    parentCateChange() {
      // 如果selectedKeys数组中的length大于0, 则证明选中的父级分类
      // 反之, 就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮, 添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件, 重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = this.addCateForm.cat_pid = 0
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类',
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败!!!')
      }
      this.$message.success('删除分类成功!!!')
      this.getCateList()
    },
    // 编辑分类弹出对话框
    editCate(row) {
      this.editCateInfo = row
      this.editCateDialogVisible = true
    },
    // 编辑分类点击确定提交
    editCateSubmit() {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateInfo.cat_id,
          { cat_name: this.editCateInfo.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
  },
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>