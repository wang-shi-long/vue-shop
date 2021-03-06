import Vue from 'vue'
import elementUI from 'element-ui'
Vue.use(elementUI)
import 'element-ui/lib/theme-chalk/index.css'

Vue.prototype.$message = elementUI.Message
Vue.prototype.$confirm = elementUI.MessageBox.confirm