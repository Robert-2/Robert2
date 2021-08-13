import './index.scss';

const SwitchToggle = {
    name: 'SwitchToggle',
    props: {
        value: { type: Boolean, required: true },
        locked: { type: Boolean, default: false },
        hideLabel: { type: Boolean, default: false },
        lockedReason: String,
    },
    methods: {
        handleSwitch() {
            if (this.locked) {
                return;
            }

            this.$emit('input', !this.value);
        },
    },
    render() {
        const {
            $t: __,
            value,
            locked,
            lockedReason,
            handleSwitch,
            hideLabel,
        } = this;

        const classNames = ['SwitchToggle', {
            'SwitchToggle--enabled': value,
            'SwitchToggle--locked': locked,
        }];

        return (
      <div class={classNames} onClick={handleSwitch}>
        <div class="SwitchToggle__slide">
          <div class="SwitchToggle__button" />
        </div>
        {!hideLabel && (
          <div class="SwitchToggle__label">
            {value && <span>{__('yes')}</span>}
            {!value && <span>{__('no')}</span>}
            {!!(locked && lockedReason) && (
              <span class="SwitchToggle__label__locked">
                ({__('locked')}: {lockedReason})
              </span>
            )}
          </div>
        )}
      </div>
        );
    },
};

export default SwitchToggle;
