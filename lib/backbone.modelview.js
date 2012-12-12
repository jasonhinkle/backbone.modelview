/*globals Backbone:true, _:true, jQuery:true*/
Backbone.ModelView = (function ( Backbone, _, $ ) {
	"use strict";

	var modelView = Backbone.View.extend({
		
		/** @var string library version */
		version: "0.10",
	  
		/** @var _.template compiled underscore template */
		template: null,

		/** @var element (required) is the element containing underscore template code (example: $('#template') ) */
		templateEl: null,

		/** @var bool automatically call save on the model when the view changes (default: false)  */
		commitOnChange: false,
		
		/** @var function if specified, will handle success event when commitOnChange is true  */
		commitSuccess: null,
		
		/** @var function if specified, will handle error event when commitOnChange is true  */
		commitError: null,

		/** @var object override backbone.events - handle when the view has been changed */
		events: { 'change': 'handleViewChange' },

		/** initialize is fired by backbone */
		initialize: function(options) {

			// if a model inside the collection changes this will fire
			if (this.model) this.model.bind('change', this.handleModelChange, this);

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

			var html = this.template({
				item: this.model
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

		/** if model changes re-render */
		handleModelChange: function(ev) {
			this.render();
		},

		/**
		 * fires when the view has changed (normally via user input).  When the user
		 * updates the value of a form input within the view, this will fire.
		 * 
		 * if commitOnChange == true then this will trigger an immediate PUT
		 * request to the server and update the model
		 * 
		 * In order to work correctly, the input control that fires the change
		 * event should have an "id" property that matches the property name
		 * of the model.  For example <input id="customerName" /> will update
		 * the "customerName" property of the model. 
		 *
		 */
		handleViewChange: function(ev) {

			if (this.commitOnChange) {

				// get the property name and value based on the input control that trigger the event
				var vals = {};
				vals[ev.target.id] = $(ev.target).val();

				// send model change to server immediately
				this.model.save(vals,{wait:true, success: this.commitSuccess, error: this.commitError});
			}
		}
	});
  
  return modelView;

}( Backbone, _, jQuery ));