// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Dashboard from './templates/Dashboard'
import Login from './templates/Login'
import Ajax from './ajax'

Vue.config.productionTip = false;

window.apiBase = "https://api.budget.chadtiffin.com/"

Vue.mixin(Ajax)

const routes = {
  '/': Dashboard,
  '/budget': Dashboard,
  '/login' : Login,
  '/logout' : Login,
  '/categories' : Dashboard,
  '/transactions' : Dashboard,
  '/accounts' : Dashboard,
  '/my-profile' : Dashboard,
  '/users' : Dashboard
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Dashboard, Login },
  computed: {
    ViewComponent () {
      return routes[this.currentRoute]
    }
  },
  render (h) {
    return h(this.ViewComponent)
  },
  data: {
  	currentRoute: window.location.pathname,
  }
})