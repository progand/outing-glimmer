import Component, { tracked } from "@glimmer/component";

export default class TripsList extends Component {
    @tracked state = {
        categorisedTrips: [],
        isLoading: true
    };
    

    didInsertElement() {
        this.loadTrips();
    }

    async loadTrips() {
        this.state = {
            ...this.state,
            isLoading: true
        }
        const res = await fetch(`https://cn.outingtravel.com/models/trips?action=includeRelationships`);
        const data = await res.json();
        const trips = this.deserialize(data);
        this.state = {
            ...this.state,
            categorisedTrips: this.calculateCategorisedTrips(trips),
            isLoading: false
        }
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
};
