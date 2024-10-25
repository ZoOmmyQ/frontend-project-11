import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import onChange from 'on-change';
import initView from './view.js';
import resources from './locales/index.js';
import parse from './parse.js';
import errors from './locales/errors.js';

const getRoute = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', 'true');
  return axios.get(result.toString());
};

const updateRssState = (link, watchState) => getRoute(link)
  .then((data) => parse(data.data.contents))
  .then((data) => {
    const { feedTitle, feedDescription, newPosts } = data;
    const feedId = _.uniqueId();
    watchState.content.feedsItem.unshift({
      feedTitle, feedDescription, link, feedId,
    });
    newPosts.forEach((item) => {
      item.postId = _.uniqueId();
    });
    const posts = [...newPosts, ...watchState.content.postsItem];
    watchState.content.postsItem = posts;
    watchState.form.error = '';
  })
  .catch((e) => {
    watchState.form.processState = 'failed';
    if (e.message === 'rssError') {
      watchState.form.error = ({ key: 'rssError' });
    }
    if (e.message === 'Network Error') {
      watchState.form.error = ({ key: 'networkError' });
    }
  });

const delay = 5000;

const updatePosts = (watchState) => {
  const promises = watchState.content.feedsItem.map((item) => getRoute(item.link)
    .then((response) => {
      const { newPosts } = parse(response.data.contents);
      newPosts.forEach((post) => {
        const uniquePostTitle = watchState.content.postsItem
          .every((postsItem) => postsItem.postTitle !== post.postTitle);
        if (uniquePostTitle) {
          const newPost = post;
          newPost.postId = _.uniqueId();
          watchState.content.postsItem.unshift(post);
        }
      });
    })
    .catch((error) => {
      watchState.form.error = error.message;
    }));

  Promise.all(promises).finally(() => {
    setTimeout(() => {
      updatePosts(watchState);
    }, delay);
  });
};

export default () => {
  const state = {
    form: {
      field: {
        url: '',
      },
      processState: '',
      error: '',
    },
    content: {
      feedsItem: [],
      postsItem: [],
    },
    modal: 'hidden',
    activePostId: '',
    readLink: new Set(),
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    readButton: document.querySelector('.full-article'),
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      yup.setLocale(errors);

      const watchState = onChange(state, initView(elements, i18n, state));

      elements.posts.addEventListener('click', (event) => {
        const clickEl = event.target;
        const { id } = clickEl.dataset;
        watchState.readLink.add(id);

        if (clickEl.tagName === 'BUTTON') {
          watchState.activePostId = id;
          watchState.modal = 'visible';
        }
      });

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const value = (formData.get('url')).trim();

        const urls = watchState.content.feedsItem.map((feed) => feed.link);
        const schema = yup.string()
          .url()
          .notOneOf(urls);

        schema.validate(value)
          .then((url) => {
            watchState.form.field.url = value;
            watchState.form.processState = 'sending';
            watchState.form.error = {};
            updateRssState(url, watchState);
            watchState.form.processState = 'success';
          })
          .catch((e) => {
            watchState.form.processState = 'failed';
            watchState.form.field.url = value;
            watchState.form.error = e.message;
          });
      });
      setTimeout(() => {
        updatePosts(watchState);
      }, delay);
    });
};
