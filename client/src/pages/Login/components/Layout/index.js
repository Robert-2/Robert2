import Config from '@/config/globalConfig';
import Logo from '@/components/Logo/Logo.vue';

export default {
  name: 'LoginLayout',
  components: { Logo },
  data() {
    return {
      year: (new Date()).getFullYear(),
      apiVersion: Config.api.version,
    };
  },
};
