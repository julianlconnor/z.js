describe("Testing z.js:", function() {

    beforeEach(function() {
        /*
        * Init z models.
        */
        this.model = new testModel();
        this.collection = new testCollection();
    });

    describe("Asserting that sync properly places dump into localStorage..", function() {
        
        it("Places model dump into localStorage:", function() {
            var dump;

            /*
            * Set an attribute and save it.
            */
            this.model.set({name: 'Julian'});
            this.model.save();

            /*
            * Upon saving the model, sync should have dumped a copy into
            * localStorage.
            */
            dump = localStorage.getItem(this.model.token());
            expect(dump).toBeDefined();

            /*
            * Make sure the dump is equivalent to the stringified JSON model.
            */
            expect(dump).toBe(JSON.stringify(this.model.toJSON()));
        });

        it("Places collection dump into localStorage:", function() {
            var dump;

            /*
            * Init new collection and save it.
            */
            this.collection = new testCollection("[{name: 'Julian'}, {name: 'Connor'}]");
            this.collection.fetch();

            /*
            * Upon saving the collection, sync should have dumped a copy into
            * localStorage.
            */
            dump = localStorage.getItem(this.collection.token());
            expect(dump).toBeDefined();

            /*
            * Make sure the dump is equivalent to the stringified JSON model.
            */
            expect(dump).toBe(JSON.stringify(this.collection.toJSON()));
        });
    });
});
