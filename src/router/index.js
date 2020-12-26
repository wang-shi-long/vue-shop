import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/Login'
import home from '@/components/Home'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: login
    }, {
      path: '/home',
      name: 'home',
      component: home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          name: 'Welcom',
          component: Welcome
        },
        {
          path: '/users',
          name: 'Users',
          component: Users
        },
        {
          path:'/rights',
          name: 'Rights',
          component: Rights
        },
        {
          path: '/roles',
          name: 'Roles',
          component: Roles
        }
      ]
    }
  ]
})

// 挂载路由导航守卫
/*to 将要访问的路径
from 从哪个路径跳转过来
next 表示放行 是一个函数
next() 放行    next('/login')  强制跳转到login */
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router