const app = new Vue({
  el: '#app',
  data: {
    stories: [],
    tags: [],
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
      console.log(err)
      alert(err.responseJSON.message)
    },
    loadTags() {
      const $vm = this;
      this.ajax('GET', '/api/tags')
        .then((r) => { $vm.tags = r; })
        .catch(this.catchError);
    },
    loadstories() {
      const $vm = this;
      this.ajax('GET', '/api/stories')
        .then((r) => { $vm.stories = r; })
        .catch(this.catchError);
    },
    createStory() {
      const $vm = this;
      this.ajax('POST', '/api/stories', this.dataNewStory)
        .then((r) => { $vm.stories.push(r); })
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
        .then((r) => { })
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
    this.loadstories();
    this.loadTags();
  },
});
