import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import SplashScreen from '@/components/SplashScreen'
import ConversationScreen from '@/components/ConversationScreen'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: SplashScreen
    },
    {
      path: '/app',
      name: 'App',
      component: ConversationScreen
    }
  ]
})
