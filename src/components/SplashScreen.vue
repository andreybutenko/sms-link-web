<template>
  <div class="splash">
    <h1>SMS Link Web</h1>
    <div class="btn" @click="signInWithGoogle">Sign in with Google</div>
    <div class="btn" @click="getGoogleResults">Get results</div>
  </div>
</template>

<script>
  import Firebase from 'firebase';
  export default {
    name: 'SplashScreen',
    data () {
      return {

      }
    },
    methods: {
      signInWithGoogle() {
        const provider = new Firebase.auth.GoogleAuthProvider();
        Firebase.auth().signInWithRedirect(provider);
      },
      getGoogleResults() {
        Firebase.auth().getRedirectResult().then(function(result) {
          console.log(result);
          if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // ...
          }
          // The signed-in user info.
          var user = result.user;
        }).catch(function(error) {
          console.log(error)
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .btn {
    border: 1px solid black;
    background-color: #34495e;
    color: white;
    cursor: pointer;
    padding: 8px;
    transition: all 250ms;

    &:hover {
      background-color: #2c3e50;
    }
  }
</style>
