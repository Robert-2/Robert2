import './index.scss';
import Illustration from './assets/illustration.svg?inline';

const CriticalError = {
    name: 'CriticalError',
    props: {
        message: String,
    },
    render() {
        const { $t: __, message } = this;

        return (
      <div class="CriticalError">
        <Illustration class="CriticalError__illustration" />
        <p class="CriticalError__message">{message ?? __('errors.critical')}</p>
        <a class="CriticalError__refresh button" href="">{__('refresh-page')}</a>
      </div>
        );
    },
};

export default CriticalError;
