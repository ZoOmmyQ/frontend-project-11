const renderErrorsHandler = (alert, elements, i18n) => {
  const errorMessage = alert !== undefined
    ? alert.key
    : alert;
  if (errorMessage) {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(errorMessage);
  } else {
    elements.input.classList.remove('is-invalid');
    elements.feedback.textContent = i18n.t('successUrl');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.form.reset();
    elements.form.focus();
  }
};

const successRenderPosts = (elements, state, i18n) => {
  state.form.field.url = '';
  const { content } = state;
  const { posts } = elements;

  posts.innerHTML = '';

  const divCard = document.createElement('div');
  divCard.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const headerPostsCard = document.createElement('h2');
  headerPostsCard.classList.add('card-title', 'h4');
  headerPostsCard.textContent = i18n.t('posts');
  divCardBody.append(headerPostsCard);

  const ulCard = document.createElement('ul');
  ulCard.classList.add('list-group', 'border-0', 'rounded-0');

  const liCards = content.postsItem.map((post) => {
    const liCard = document.createElement('li');
    liCard.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const { postTitle, postLink, postId } = post;

    const a = document.createElement('a');
    a.setAttribute('href', postLink);
    a.setAttribute('class', 'fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', postId);
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = postTitle;

    if (state.readLink.has(postId)) {
      a.classList.remove('fw-bold');
      a.classList.add('link-secondary', 'fw-normal');
    }

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', postId);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('viewing');

    liCard.append(a);
    liCard.append(button);

    return liCard;
  });

  ulCard.append(...liCards);

  divCard.append(divCardBody);
  divCard.append(ulCard);
  posts.append(divCard);
};

const successRenderFeeds = (elements, state, i18n) => {
  const { content } = state;
  const { feeds } = elements;

  feeds.innerHTML = '';

  const divCard = document.createElement('div');
  divCard.classList.add('card', 'border-0');

  const divCardBody = document.createElement('div');
  divCardBody.classList.add('card-body');

  const headerFeedsCard = document.createElement('h2');
  headerFeedsCard.classList.add('card-title', 'h4');
  headerFeedsCard.textContent = i18n.t('feeds');

  divCardBody.append(headerFeedsCard);

  const ulCard = document.createElement('ul');
  ulCard.classList.add('list-group', 'border-0', 'rounded-0');

  content.feedsItem.forEach((feed) => {
    const liCard = document.createElement('li');
    liCard.classList.add('list-group-item', 'border-0', 'border-end-0');

    const { feedTitle, feedDescription } = feed;

    const h3Li = document.createElement('h3');
    h3Li.classList.add('h6', 'm-0');
    h3Li.textContent = feedTitle;

    const pLi = document.createElement('p');
    pLi.classList.add('m-0', 'small', 'text-black-50');
    pLi.textContent = feedDescription;

    liCard.append(h3Li);
    liCard.append(pLi);

    ulCard.appendChild(liCard);
  });

  divCard.append(divCardBody);
  divCard.append(ulCard);
  feeds.append(divCard);
};

const modalRender = (elements, state) => {
  const { modalTitle, modalDescription, readButton } = elements;
  const { content, activePostId } = state;

  const selectedPost = content.postsItem.find((post) => activePostId === post.postId);

  if (selectedPost) {
    modalTitle.textContent = selectedPost.postTitle;
    modalDescription.textContent = selectedPost.postDescription;
    readButton.href = selectedPost.postLink;
  }
};

const renderWatchedLinks = (state) => {
  const { readLink } = state;
  readLink.forEach((postId) => {
    const post = document.querySelector(`[data-id="${postId}"]`);
    post.classList.add('fw-normal', 'link-secondary');
    post.classList.remove('fw-bold');
  });
};

const handleProcessState = (elements, process, state, i18n) => {
  switch (process) {
    case 'failed':
      elements.submit.disabled = false;
      elements.input.focus();
      break;
    case 'sending':
      elements.submit.disabled = true;
      elements.form.focus();
      break;

    case 'success':
      elements.submit.disabled = false;
      elements.form.reset();
      elements.form.focus();
      successRenderFeeds(elements, state, i18n);
      successRenderPosts(elements, state, i18n);
      break;

    default:
      throw new Error(`Unknown process ${process}`);
  }
};

const initView = (elements, i18n, state) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value, state, i18n);
      break;

    case 'form.error':
      renderErrorsHandler(value, elements, i18n);
      break;

    case 'content.postsItem':
      successRenderPosts(elements, state, i18n);
      renderWatchedLinks(state);
      break;

    case 'content.feedsItem':
      successRenderFeeds(elements, state, i18n);
      renderWatchedLinks(state);
      break;

    case 'activePostId':
      modalRender(elements, state);
      break;

    case 'readLink':
      renderWatchedLinks(state);
      break;

    default:
      break;
  }
};

export default initView;
