import Component, { tracked } from "@glimmer/component";

export default class TripsList extends Component {
    @tracked trips: Array<Object>;
    @tracked isLoading = true;

    didInsertElement() {
        this.loadTrips();
    }

    async loadTrips() {
        this.isLoading = true;
        const res = await fetch(`https://cn.outingtravel.com/models/trips?action=includeRelationships`);
        const data = await res.json();
        this.trips = data.trips;
        this.isLoading = false;
    }
};
