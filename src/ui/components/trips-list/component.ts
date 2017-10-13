import Component, { tracked } from "@glimmer/component";

export default class TripsList extends Component {
    @tracked categorisedTrips: Array<any>;
    @tracked isLoading = true;
    // number of trips to show in each category by default
    maxTripsOnLoad: 6;

    didInsertElement() {
        this.loadTrips();
    }

    async loadTrips() {
        this.isLoading = true;
        const res = await fetch(`https://cn.outingtravel.com/models/trips?action=includeRelationships`);
        const data = await res.json();
        const trips = this.deserialize(data);
        this.categorisedTrips = this.calculateCategorisedTrips(trips);
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

    calculateCategorisedTrips(trips = []) {
        return trips
            .sort((trip1, trip2) => trip1.order > trip2.order ? -1 : 1)
            .reduce((result, trip) => {
                const isTripFinished = Date.parse(trip.dateEnd) < Date.now() || trip.status === 'finished';
                const may12 = new Date(2017, 4, 12);
                if (String(trip.name).startsWith('AIESEC')) {
                    result[0].items.push(trip);
                } else if (!isTripFinished && Date.parse(trip.dateEnd) < may12.getTime()) {
                    result[1].items.push(trip);
                } else if (!isTripFinished && Date.parse(trip.dateEnd) >= may12.getTime()) {
                    result[2].items.push(trip);
                } else if (isTripFinished) {
                    result[3].items.push(trip);
                }
                return result;
            }, [
                { headingTranslationKey: 'AIESEC Volunteering', items: [] },
                { headingTranslationKey: 'Weekend Outings', items: [] },
                { headingTranslationKey: 'Vacation Journeys', items: [] },
                { headingTranslationKey: 'Finished Trips', items: [] }
            ])
            .map(category => {
                return {
                    ...category,
                    visibleItems: category.items.slice(0, 6),
                    hasMore: category.items.length > 6
                };
            });
    }


    showMore(category) {
        const categoryIndex = this.categorisedTrips.indexOf(category);
        const visibleItems = category.items.slice(0, category.visibleItems.length + 6);
        const hasMore = category.items.length > visibleItems.length
        const updatedCategory = {
            ...category,
            visibleItems,
            hasMore
        }
        //replace category
        this.categorisedTrips = [
            ...this.categorisedTrips.slice(0, categoryIndex),
            updatedCategory,
            ...this.categorisedTrips.slice(categoryIndex+1)
        ];
        console.log(this.categorisedTrips);
    }
};
