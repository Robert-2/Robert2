import './index.scss';

const Loading = {
  name: 'Loading',
  render() {
    const { $t: __ } = this;

    return (
      <div class="Loading">
        <svg class="Loading__spinner" viewBox="0 0 50 50">
          <circle class="Loading__spinner__path" cx="25" cy="25" r="20" fill="none" />
        </svg>
        <span class="Loading__text">{__('loading')}</span>
      </div>
    );
  },
};

export default Loading;
