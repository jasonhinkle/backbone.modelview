/*globals Backbone:true, _:true, jQuery:true*/
Backbone.CollectionView = (function ( Backbone, _, $ ) {
	"use strict";

	var collectionView = Backbone.View.extend({
		
		/** @var library version */
		version: "0.10",
	  
		/** @var compiled underscore template */
		template: null,

		/** @var templateEl (required) is the element containing the underscore template code */
		templateEl: null,

		/** @var automatically update the model on every change  */
		commitOnChange: false,

		/** @var override backbone.events - handle when the view has been changed */
		events: { 'change': 'handleViewChange' },

		/** initialize is fired by backbone immediately after construction */
		initialize: function(options) {

			// if the collection changes these will fire
			this.collection.bind('add', this.handleCollectionAdd, this);
			this.collection.bind('remove', this.handleCollectionRemove, this);
			this.collection.bind('reset', this.handleCollectionReset, this);

			// if a model inside the collection changes this will fire
			this.collection.bind('change', this.handleModelChange, this);

			// allow the custom options to be initialized at construction
			this.templateEl = options.templateEl;
			if (options.commitOnChange) this.commitOnChange = options.commitOnChange;

			if (options.on) {
				for (evt in options.on) {
					this.on(evt,options.on[evt]);
				}
			}
		},

		/** prepare will pre-compile the underscore template if necessary */
		prepare: function() {

			if (!this.template) {

				var tpl = this.templateEl.html();
				this.template = _.template( tpl );
			}
		},

		/** render populates the container element with contents of the template */
		render: function() {

			this.prepare();

			// convert the collection to a simple json object so the templates are not so verbose
			var html = this.template({
				items: this.collection,
				page: {
					totalResults: this.collection.totalResults, 
					totalPages: this.collection.totalPages, 
					currentPage: this.collection.currentPage,
					orderBy: this.collection.orderBy,
					orderDesc: this.collection.orderDesc
				}
			});

			// if this.el is null then it's likely that the collection view was initialized prior to document.ready firing
			if (typeof(this.el) == 'undefined' && console) console.warn(
				$(document).ready 
					? 'ModelView.render container element is undefined' 
					: 'ModelView.render called before document.ready was fired'
			);
			
			$(this.el).html(html);

			// let any interested parties know that render is complete
			this.trigger('rendered');
		},

		/** if collection changes re-render */
		handleCollectionAdd: function(m) {
			this.render();
		},

		/** if collection changes re-render */
		handleCollectionRemove: function(m) {
			this.render();
		},

		/** if collection changes re-render */
		handleCollectionReset: function(ev) {
			this.render();
		},

		/** if collection changes re-render */
		handleModelChange: function(ev) {
			this.render();
		},

		/**
		 * fires when the view has changed (normally via user input).  When the user
		 * updates the value of a form input within the view, this will fire.
		 *
		 * If commitOnChange=true then model changes will be posted to the
		 * server automatically
		 *
		 * In order for this method to determine the primary key and property name
		 * of the input that was updated the id property of the input must be set
		 * in the following format:
		 *
		 * <input id="[prop]_[id]"  ... />
		 *
		 * where [prop] is the name of the model propery and [id] is the
		 * id (unique id) of the model
		 */
		handleViewChange: function(ev) {

			if (commitOnChange) {

				// use the name of the input element to determine what field changed
				var pair = ev.target.id.split('_');
				var propName = pair[0];
				var id = pair[1];

				//  get the new value
				var val = $(ev.target).val();

				// get the model from the collection
				var m = this.collection.get(id);

				// specify the property and new value
				var options = {};
				options[propName] = val;

				// post model change to server (which will fire a change event on the model)
				m.set( options );
			}
		}
	});
  
  return collectionView;

}( Backbone, _, jQuery ));