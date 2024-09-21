export const FakeService = {
    getData() {
        return [
            { name: 'Afghanistan', code: 'AF' },
            { name: 'Albania', code: 'AL' },
            { name: 'Algeria', code: 'DZ' },
          
        ];
    },

    getCountries() {
        return Promise.resolve(this.getData());
    }
};
    