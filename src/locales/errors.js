export default {
  mixed: {
    notOneOf: () => ({ key: 'dublicateError' }),
    required: () => ({ key: 'notEmpty' }),
  },
  string: {
    url: () => ({ key: 'urlError' }),
  },
};
