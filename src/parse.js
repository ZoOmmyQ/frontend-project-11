export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const error = new Error('rssError');
    error.isParsingError = true;
    throw error;
  }

  const feedTitle = doc.querySelector('channel > title').textContent;
  const feedDescription = doc.querySelector('channel > description').textContent;
  const postItems = doc.querySelectorAll('item');
  const newPosts = [];
  postItems.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    newPosts.push({
      postTitle,
      postDescription,
      postLink,
    });
  });
  const obj = {
    feedTitle, feedDescription, newPosts,
  };
  return obj;
};
