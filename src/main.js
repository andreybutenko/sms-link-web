import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false

import Firebase from 'firebase';
const firebaseConfig = {
  apiKey: "AIzaSyBUKZXLxI-fszvOmDz7u9SHY-l0FIIJPFI",
  authDomain: "sms-link.firebaseapp.com",
  databaseURL: "https://sms-link.firebaseio.com",
  projectId: "sms-link",
  storageBucket: "sms-link.appspot.com",
  messagingSenderId: "890812920909"
};
Firebase.initializeApp(firebaseConfig);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
