export default {
  namespaced: true,
  state: {
    id: null,
    groupId: null,
    firstName: '',
    lastName: '',
    pseudo: '',
    email: '',
    locale: '',
    restrictedParks: [],
  },
  mutations: {
    init(state, data) {
      state.id = data.id;
      state.groupId = data.group_id;
      state.firstName = data.first_name;
      state.lastName = data.last_name;
      state.pseudo = data.pseudo;
      state.email = data.email;
      state.locale = data.settings ? data.settings.language : 'en';
      state.restrictedParks = data.restricted_parks;
    },

    setLocale(state, locale) {
      state.locale = locale;
    },

    setInfos(state, newInfos) {
      state.firstName = newInfos.first_name;
      state.lastName = newInfos.last_name;
      state.pseudo = newInfos.pseudo;
      state.email = newInfos.email;
    },

    reset(state) {
      state.id = null;
      state.groupId = null;
      state.firstName = '';
      state.lastName = '';
      state.pseudo = '';
      state.email = '';
      state.restrictedParks = [];
    },
  },
  getters: { fullName: (state) => `${state.lastName} ${state.firstName}` },
  actions: {},
};
