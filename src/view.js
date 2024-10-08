import onChange from 'on-change';

const renderProcessForm = (input, statusMessage, formButton) => {
  input.setAttribute('readonly', 'true');
  input.classList.remove('is-invalid');
  statusMessage.textContent = '';
  formButton.setAttribute('disabled', '');
};

const renderSuccessForm = (input, statusMessage, i18next, formButton) => {
  input.classList.remove('is-invalid');
  input.value = '';
  statusMessage.classList.remove('text-danger');
  statusMessage.classList.add('text-success');
  statusMessage.textContent = i18next.t('status.success');
  input.removeAttribute('readonly');
  formButton.removeAttribute('disabled');
};

const renderErrorForm = (input, statusMessage, i18next, error, formButton) => {
  input.classList.add('is-invalid');
  statusMessage.classList.add('text-danger');
  statusMessage.textContent = i18next.t(`status.${error}`);
  input.removeAttribute('readonly');
  formButton.removeAttribute('disabled');
};

const renderContainer = (type, i18next) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18next.t('feeds.title') : i18next.t('posts.title');
  const list = document.createElement('ul');
  cardBody.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const renderPosts = (elems, posts, i18n) => {
  elems.posts.innerHTML = null;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('posting');
  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {
    const { id, title } = post;
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.dataset.id = id;
    btn.dataset.bsToggle = 'modal';
    btn.dataset.bsTarget = '#modal';
    btn.textContent = i18n.t('review');
    btn.setAttribute('type', 'button');
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.textContent = title;
    a.classList.add('fw-bold');
    a.dataset.id = id;
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');

    listGroupItem.append(a);
    listGroupItem.append(btn);
    listGroup.prepend(listGroupItem);
  });
  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);
  elems.posts.append(card);
};

const renderFeeds = (elems, feeds, i18n) => {
  elems.feeds.innerHTML = null;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('feeds');
  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((feed) => {
    const listGroupItem = document.createElement('li');
    listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.textContent = feed.description;
    p.classList.add('m-0', 'small', 'text-black-50');

    h3.append(p);
    listGroupItem.append(h3);
    listGroup.prepend(listGroupItem);
  });
  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(listGroup);
  elems.feeds.append(card);
};

const keepSeenPosts = (iDs) => {
  iDs.forEach((id) => {
    const seenPost = document.querySelector(`a[data-id="${id}"]`);
    seenPost.classList.remove('fw-bold');
    seenPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('#modal .modal-title');
  const body = modalEl.querySelector('#modal .modal-body');
  const readFullArticle = modalEl.querySelector('#modal a');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
};

export default (state, i18next, el) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.status':
      switch (value) {
        case 'success':
          renderSuccessForm(el.input, el.statusMessage, i18next, el.formButton);
          break;
        case 'inProcess':
          renderProcessForm(el.input, el.statusMessage, el.formButton);
          break;
        case 'error':
          renderErrorForm(el.input, el.statusMessage, i18next, state.form.error, el.formButton);
          break;
        default:
          throw new Error('Unexpected form status');
      }
      break;
    case 'rss.feeds':
      renderFeeds(el.feeds, i18next, value);
      break;
    case 'rss.posts':
      renderPosts(el.posts, i18next, value);
      keepSeenPosts(state.rss.seenPosts);
      break;
    case 'rss.seenPosts':
      keepSeenPosts(value);
      break;
    case 'modal':
      renderModalWindow(el.modal, value);
      break;
    default:
      break;
  }
});
