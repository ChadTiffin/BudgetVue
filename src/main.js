// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from './templates/Dashboard'
import Public from './templates/Public'
import Ajax from './ajax'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

Vue.config.productionTip = false;

window.apiBase = "https://api.budget.chadtiffin.com/"
//window.apiBase = "https://budget-api.demos.chadtiffin.com/"

Vue.mixin(Ajax)
Vue.use(VueRouter);

const routes = [
  {path: '/', component: Dashboard},
  {path: '/budget', component: Dashboard},
  {path: '/login' , component: Public},
  {path: '/logout' , component: Public},
  {path: '/categories' , component: Dashboard},
  {path: '/transactions', component: Dashboard},
  {path: '/clear-imported-transactions', component: Dashboard},
  {path: '/accounts' , component: Dashboard},
  {path: '/my-profile' , component: Dashboard},
  {path: '/users' , component: Dashboard},
  {path: '/reset-password/:token' , component: Public}
]

const router = new VueRouter({
  routes, // short for `routes: routes`
  mode: 'history'
})

/* eslint-disable no-new */
const app = new Vue({
  router
}).$mount("#app")