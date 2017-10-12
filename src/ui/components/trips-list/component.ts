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
        this.trips = this.deserialize(data);
        this.isLoading = false;
    }

    deserialize(data: any) {
        const { trips, photos, users } = data;
        const result = trips.map(item => {
            const organiserData = this.getByValue(users, item.organiser);
            const organiser = {
                ...organiserData,
                photo: this.getByValue(photos, organiserData.photo),
                photos: organiserData.photos.map(photoId => this.getByValue(photos, photoId))
            }
            const trip = {
                ...item,
                coverPhoto: this.getByValue(photos, item.coverPhoto),
                photos: item.photos.map(photoId => this.getByValue(photos, photoId)),
                organiser
            };
            return trip;
        });

        return result;
    }

    getByValue(collection, fieldValue, fieldName = 'id') {
        return collection.find(item => item[fieldName] === fieldValue);
    }
};
