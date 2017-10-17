import Component from '@glimmer/component';

export default class TripItem extends Component {    
    get dateInterval() {
        const start = new Date(this.args.trip.dateStart);
        const end = new Date(this.args.trip.dateEnd);

        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }

    get coverPhotoURL(){
        return this.getPhotoURL(this.args.trip.coverPhoto, 'default');
    }

    get organiserPhotoURL(){
        return this.getPhotoURL(this.args.trip.organiser.photo, 'default');
    }

    getPhotoURL(photo, size){
        return photo.sizes && photo.sizes[size] || photo.url;
    }
};
