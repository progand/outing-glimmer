import Component, { tracked } from '@glimmer/component';

// number of trips to show in each category by default
const maxTripsOnLoad = 6;

export default class TripsBlock extends Component {
    @tracked state = {
        visibleCount: maxTripsOnLoad
    };

    @tracked('args.items', 'state')
    get visibleItems() {
        return this.args.items.slice(0, this.state.visibleCount);
    }

    @tracked('args.items.length', 'state')
    get hasMore() {
        return this.args.items.length > this.state.visibleCount;
    }

    showMore() {
        this.state = {
            ...this.state,
            visibleCount: this.state.visibleCount + maxTripsOnLoad
        }
    }
};
