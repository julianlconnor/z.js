/*
* Place test zModel and zCollection on window.
*/
window.testModel      = Backbone.zModel.extend({
    url : '/testModel'
});

window.testCollection = Backbone.zCollection.extend({
    url : '/testCollection'
});
