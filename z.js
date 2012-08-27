/*
* z.js is a library for persisting data throughout multiple webviews.
* E.g., an iPhone app that handles 5+ webviews should never have stale
* data. 
*
* This library implements a new model toJSON() & collection each method that
* checks the contents of models/collections stored in localStorage.
*
* z.base.sync updates localStorage with the stringified contents of the
* model/collection.
*
*/

// TODO: I'm predicting context issues.. (maybe)
// TODO: Avoid more than one stringification each pass.
// TODO: Namespace all methods differently in order to avoid collisions.

Backbone.zModel = Backbone.Model;
Backbone.zCollection = Backbone.Collection;

window.z = {};

z.base = {
    /*
    * Methods that both models and collections will inherit.
    */

    sync : function( method, model, options ) {
        /*
        * Wrapper around Backbone sync that updates localStorage.
        */
        dfd = $.Deferred();

        dfd.then(_.bind(this.saveDump, this));
        dfd.resolveWith(Backbone.sync.apply(this, arguments));

        return dfd;
    },

    token : function() {
        /*
        * Memoized token call that will either return or compute the proper
        * token necessary for storing values in localStorage.
        */
        var _this = this.collection || this;

        if ( !this._token ) {
            /*
            * Memoize token.
            *
            * If no key, use url || urlRoot in combination with CID to
            * store value.
            */
            this._token = _.isFunction(_this.url) ? _this.url() : _this.url;
            
            if ( !this.collection && this.cid )
                this._token = this.cid + this._token;
        }

        return this._token;
    },

    assert : function(dump) {
        /*
        * Asserts the equality of two dumps.
        */
        if ( !_.isString(dump) )
            throw new Error('[z] Assertion of two dumps received an invalid parameter (not a string).');
        
        return ( dump === localStorage.getItem(this.token()) );
    },

    saveDump : function(raw) {
        /*
        * Saves a dump of the returned payload into localStorage.
        */

        return localStorage.setItem(this.token(), this.generateDump(this.toJSON()));
    },

    generateDump : function(obj) {
        /*
        * Simple helper.
        */
        return JSON.stringify(obj);
    },

    semaphore : function() {
        /* 
        * Checks localStorage and will BLOCK if attrs are stale.
        *
        * Will default to collection if being called from the context of a
        * model.
        */
        var _dump = this.generateDump((this.collection || this).toJSON());

        if ( !this.assert(_dump) ) {
            this.hold();
            (this.collection || this).fetch({ async: false, silent: true});
            this.free();
        }
    },

    hold : function() {
        /*
        * Called while the semaphore is blocking.
        *
        * Place all transient code between calls here. E.g., showing divs,
        * loading..
        */
        return;
    },

    free : function() {
        /*
        * Invoked once the semaphore releases control.
        *
        * Place all transient cleanup here. E.g., hiding divs.
        */
        return;
    }
};

z.model = {
    /*
    * Method(s) necessary to ensure z model data. I use .toJSON() to render
    * models.
    */

    freshJSON : function() {
        /*
        * Aye, Fresh JSON here!
        *
        * The call to semaphore BLOCKS EXECUTION IF AN UPDATE IS NECESSARY.
        *
        * Returns fresh json.
        */
        this.semaphore();

        return this.toJSON();
    }
};

z.collection = {
    /*
    * Method(s) necessary to ensure fresh collection data. I use mostly _.each
    * to render collections.
    */

    each : function(fn) {
        /*
        * Asserts state, will block if stale.
        *
        * The call to semaphore BLOCKS EXECUTION IF AN UPDATE IS NECESSARY.
        *
        * Loops through collection and invokes fn on each.
        */
        this.semaphore();

        return _.each.apply(_, [this.models].concat(_.toArray(arguments)));
    }
};

/*
* Extend our custom model & collection prototypes with the z object.
*/
_.extend(Backbone.zModel.prototype, z.base, z.model);
_.extend(Backbone.zCollection.prototype, z.base, z.collection);

/*
* Garbage collect window.z..
*/
delete window['z'];


