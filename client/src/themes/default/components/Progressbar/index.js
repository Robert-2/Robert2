import './index.scss';

// @vue/component
export default {
    name: 'Progressbar',
    props: {
        percent: { type: Number, required: true },
    },
    computed: {
        humanPercent() {
            return Math.round(this.percent);
        },
    },
    render() {
        const { $t: __, percent, humanPercent } = this;

        return (
            <div class="Progressbar">
                <div class="Progressbar__progress" style={{ width: `${percent}%` }}>
                    {percent < 100 && <span>{humanPercent}%</span>}
                    {percent === 100 && <span>{__('almost-done')}</span>}
                </div>
            </div>
        );
    },
};
