<template>
  <div class="app">
    <!--
      <h1>SMS Link Web</h1>
      <div class="btn" @click="signInWithGoogle">Sign in</div>
    -->
    <div class="conversationList">
      <div
        class="conversationItem"
        v-for="conversation in conversations"
        :class="{ selected: conversation.threadId == selectedConversationThreadId }"
        @click="selectedConversationThreadId = conversation.threadId">
        <div class="conversation-photo">
          <img
            v-if="!!conversation.contact && !!conversation.contact.photo && false"
            :src="'http://localhost/images/' + conversation.contact.photo + '.png'" />
        </div>
        <div class="conversation-data">
          <div class="conversation-name">{{ getConversationName(conversation) }}</div>
          <div class="conversation-preview" v-if="!!conversation.message.content">{{ conversation.message.content }}</div>
        </div>
      </div>
    </div>

    <div class="conversationDisplay">
      <div
        class="message"
        v-for="message in currentConversation.messages"
        :class="{
          mine: message.mine,
          imageLoading: !!message.images && !message.imageLoaded,
          label: !!message.label
        }">
        <template v-if="message.label">
          {{ message.label }}
        </template>
        <template v-else>
          <div v-if="!!message.images && !message.imageLoaded" class="image-placeholder">
            <div class="image-placeholder-content">
              <spinner />
              <span>Loading image...</span>
            </div>
          </div>
          <img
            v-if="!!message.images"
            :src="'http://localhost/images/' + message.images[0].file + '.png'"
            @load="message.imageLoaded = true" />
          <div v-if="!!message.content" class="text">
            {{ message.content }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
  import Spinner from 'vue-simple-spinner'
  import Firebase from 'firebase';
  import io from 'socket.io-client';
  const socket = io('http://localhost');
  socket.connect();
  import moment from 'moment';
  export default {
    name: 'Conversations',
    components: {
      Spinner
    },
    data() {
      return {
        token: '',
        selectedConversationThreadId: -1,
        conversations: []
      }
    },
    mounted() {
      this.setListeners();
      Firebase.auth().onIdTokenChanged(user => {
        this.getAuthToken(() => {
          this.authenticate();
          this.getListing();
        });
      });
    },
    updated() {
      this.scrollToBottom();
    },
    watch: {
      selectedConversationThreadId() {
        const conversation = this.findConversationById(this.selectedConversationThreadId);
        if(!conversation.loaded) {
          console.log('loading!')
          conversation.loaded = true;
          this.getConversation(this.selectedConversationThreadId);
        }
      }
    },
    computed: {
      currentConversation() {
        return this.selectedConversationThreadId !== -1 ? this.findConversationById(this.selectedConversationThreadId) : { messages: [] };
      }
    },
    methods: {
      signInWithGoogle() {
        const provider = new Firebase.auth.GoogleAuthProvider();
        Firebase.auth().signInWithRedirect(provider);
      },
      getAuthToken(cb) {
        if(!!Firebase.auth().currentUser) {
          Firebase.auth().currentUser.getIdToken()
            .then(result => {
              console.log('Got token!')
              this.token = result;
              cb();
            })
            .catch(err => {
              console.log(err)
            });
        }
      },
      setListeners() {
        socket.on('FETCH/LISTING/RESULT', res => {
          console.log(res)
          this.conversations = res.map(conversation => {
            return {
              ...conversation,
              messages: [],
              loaded: false
            }
          });
        });

        socket.on('FETCH/CONVERSATION/RESULT', res => {
          const conversation = this.findConversationById(res[0].threadId);
          const messages = res.reverse().map(message => {
            return {
              ...message,
              imageLoaded: false
            };
          });

          const newMessages = [];
          let lastDate = new Date(0);
          let insertations = 0;

          const BREAK_SENSITIVITY = 1 * 60 * 60 * 1000; // 1 hour

          for(let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const date = new Date(message.date);

            let isToday = this.getDateId(lastDate) === this.getDateId(new Date());
            let isYear = isToday && date.getFullYear() == new Date().getFullYear();
            let isRecent = isToday || date.getTime() > new Date().getTime() - BREAK_SENSITIVITY;

            let label = '';

            if(!isToday) label += moment(date).format('dddd, MMMM D');
            if(!isYear) label += moment(date).format(' YYYY');
            if(!isToday) label += ' · ';
            if(!isRecent) label += moment(date).format('h:mm A');

            if(label != '') {
              newMessages.push({
                label: label
              });
            }

            newMessages.push(messages[i]);
            lastDate = date;
          }

          conversation.messages = newMessages;
        });
      },
      formatDate(date) {
        return `${date}`
      },
      getDateId(date) {
        return '' + date.getMonth() + date.getDate() + date.getFullYear();
      },
      getConversationName(conversation) {
        return conversation.contacts.reduce((sum, contact, i, array) => {
          return sum + contact.name
        }, '')
      },
      findConversationById(threadId) {
        return this.conversations.filter(conversation => conversation.threadId === threadId)[0];
      },
      authenticate() {
        socket.emit('AUTH', this.token)
      },
      testAuthentication() {
        socket.emit('RESTRICTED', 'hi');
      },
      getListing() {
        socket.emit('FETCH/LISTING');
      },
      getConversation(threadId) {
        socket.emit('FETCH/CONVERSATION', {
          threadId: threadId
        });
      },
      scrollToBottom() {
        const container = this.$el.querySelector(".conversationDisplay");
        console.log(container.scrollHeight)
        container.scrollTop = container.scrollHeight;
      }
    }
  }
</script>

<style lang="scss" scoped>
  html, body, .app {
    overflow-y: hidden;
    height: 100vh;
  }

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

  .app {
    display: flex;

    .conversationList {
      flex: 1;
      overflow-y: scroll;

      .conversationItem {
        padding: 16px;
        border-bottom: 1px solid #ccc;
        cursor: pointer;

        &.selected {
          background-color: #3498db;
        }

        .conversation-photo {
          img {
            width: 60px;
            height: 60px;
          }
        }

        .conversation-data {
          .conversation-name {
            font-weight: bold;
          }

          .conversation-preview {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }
    }

    .conversationDisplay {
      flex: 3;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      padding: 0 16px;

      .message {
        align-self: flex-start;
        max-width: 60%;

        &.mine {
          align-self: flex-end;

          .text {
            background-color: #ecf0f1;
          }
        }

        &.label {
          max-width: 100%;
          width: 100%;
          text-align: center;
          margin: 32px 0;
        }

        .text {
          background-color: #c8f7c5;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          word-wrap: break-word;
        }

        img {
          max-width: 100%;
          max-height: 50vh;
          border-radius: 4px;
        }

        &.imageLoading {
          width: 100%;

          .image-placeholder {
            height: 50vh;
            width: 100%;

            display: flex;
            justify-content: center;
            align-items: center;

            border: 1px solid black;
            border-radius: 4px;

            margin-bottom: 4px;

            .image-placeholder-content {
              & > div {
                margin-bottom: 8px;
              }
            }
          }

          img {
            display: none;
          }
        }
      }
    }
  }
</style>
