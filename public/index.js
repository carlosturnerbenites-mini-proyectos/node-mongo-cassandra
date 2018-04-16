/* global $, Vue */
const app = new Vue({
  el: '#app',
  data: {
    people: [],
    stories: [],
    tags: [],
    modal: false,
    dataNewStory: {
      title: '',
      tags: [],
    },
    dataNewTag: {
      name: '',
    },
  },
  filter: {

  },
  computed: {

  },
  watch: {

  },
  methods: {
    toggleModal() {
      this.modal = !this.modal;
    },
    ajax(type, url, data) {
      return new Promise((resolve, reject) => {
        $.ajax({
          type,
          url,
          data: JSON.stringify(data),
          dataType: 'json',
          contentType: 'application/json',
          complete(r) { resolve(r.responseJSON); },
          error(e) { reject(e); },
        });
      });
    },
    catchError(err) {
    },
    loadTags() {
      const $vm = this;
      this.ajax('GET', '/api/tags')
        .then((r) => { $vm.tags = r; })
        .catch(this.catchError);
    },
    loadStories() {
      const $vm = this;
      this.ajax('GET', '/api/stories')
        .then((r) => { $vm.stories = r; })
        .catch(this.catchError);
    },
    loadPeople() {
      const $vm = this;
      this.ajax('GET', '/api/people')
        .then((r) => { $vm.people = r; })
        // .catch(this.catchError);
    },
    createStory() {
      const $vm = this;
      this.ajax('POST', '/api/stories', this.dataNewStory)
        .then((r) => { $vm.stories.push(r); })
        .then(this.toggleModal)
        .catch(this.catchError);
    },
    createTag() {
      const $vm = this;
      this.ajax('POST', '/api/tags', this.dataNewTag)
        .then((r) => { $vm.tags = r; })
        .catch(this.catchError);
    },
    removeAllStories() {
      const $vm = this;
      this.ajax('DELETE', '/api/stories', this.dataNewStory)
        .then((r) => { $vm.stories = []; })
        .catch(this.catchError);
    },
    updateStory(story) {
      const $vm = this;
      this.ajax('PUT', '/api/story', story)
        // .then((r) => {})
        .catch(this.catchError);
    },
    deleteStory(story) {
      const $vm = this;
      this.ajax('DELETE', '/api/story', story)
        .then((r) => { $vm.stories = r; })
        .catch(this.catchError);
    },
    deleteTag(tag) {
      const $vm = this;
      this.ajax('DELETE', '/api/tag', tag)
        .then((r) => { $vm.tags = r; })
        .catch(this.catchError);
    },
  },
  mounted() {
    this.loadStories();
    this.loadPeople();
    this.loadTags();
  },
});
