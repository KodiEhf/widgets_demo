(function(_g_) {
   // The _g_.LMD global is shared by many widgets. Keep that in mind.
   _g_.LMD.api_domain = 'http://radiant-brook-7344.herokuapp.com';
   _g_.LMD.cross_domain = _g_.LMD.api_domain.indexOf(location.host) != -1;
   _g_.LMD.handler = true;
   _g_.LMD.version = "0.0.1";
   _g_.LMD.get_attributes =
     function(element) {
       var lang = element.getAttribute('lang') != null ? element.getAttribute('lang') : 'en';
       var attributes = {'lang': lang};
       for (var i = 0, attrs = element.attributes, l = attrs.length; i < l; i++) {
	 var attribute_name = attrs[i].nodeName;
	 var option = attribute_name.match(/data-lmd-(.*)/);
	 if (option) {
	   attributes[option[1]] = attrs[i].nodeValue;
	 }
       }
       return attributes;
     };
   _g_.LMD.bootstrap_dom = 
     function(attributes, type) {
       var wrapper = document.createElement('div');
       wrapper.setAttribute('class', 'lmd_embed');
       wrapper.setAttribute('lang', attributes['lang']);
       if ('width' in attributes)
	 wrapper.setAttribute('style', 'width: '+attributes['width']+'px;');
       // Maybe add a title
       if ('title' in attributes) {
	 var headline = document.createElement('h1');
	 headline.setAttribute('class', 'lmd_embed_title')
	 headline.appendChild(document.createTextNode(attributes['title']));
	 wrapper.appendChild(headline);
       }
       // Create the inner div, this is the one we edit later on.
       var inner_wrapper = document.createElement('div');
       inner_wrapper.setAttribute('class', 'lmd_embed_wrapper_'+type);
       // Insert loading text
       var loading_text = document.createElement('strong')
       loading_text.setAttribute('class', 'lmd_embed_loading');
       loading_text.appendChild(document.createTextNode(attributes['lang'] == 'is' ?
							'Hleð gögnum' : 'Loading data'));
       // Stich together, and replace the script tag
       inner_wrapper.appendChild(loading_text);
       wrapper.appendChild(inner_wrapper);
       return { 'wrapper': wrapper, 'inner_wrapper': inner_wrapper };
     };
   _g_.LMD.deferred =
     function() {
       var WAITING = 0,
           RESOLVED = 1,
	   REJECTED = 2;
       var state = {
	   _then: function() {},
	   _fail: function() {},
	   result: null,
	   status: WAITING 
       };
       return {
	 promise: function() {
	   return {
	     then: function(callback) {
	       state._then = callback;
	       if (state.status === RESOLVED) {
		 state._then(state.result);
	       }
	     },
	     fail: function(callback) {
	       state._fail = callback;
	       if (state.status === REJECTED) {
		 state._fail(state.result)
	       }
	     }
	   }
	 },
	 resolve: function(res) {
	   state.result = res;
	   state.status = RESOLVED;
	   state._then(res);
	 },
	 reject: function(res) {
	   state.result = res;
	   state.status = REJECTED;
	   state._fail(res);
	 }
       }
     };
   _g_.LMD.insure_jquery =
     function() {
       var retval = new _g_.LMD.deferred();
       if (_g_.LMD.$) {
	 retval.resolve();
       } else if (_g_.jQuery && _g_.jQuery.fn.jquery == '2.0.0') {
	 _g_.LMD.$ = _g_.jQuery;
	 retval.resolve();
       } else {
	 var old_jq = undefined;
	 if (_g_.jQuery)
	   old_jq = _g_.jQuery.noConflict();
	 _g_.LMD.inject_script(
	   function() { retval.reject() },
	   function() {
	     _g_.LMD.$ = jQuery.noConflict();
	     if (old_jq) {
	       _g_.jQuery = old_jq.noConflict();
	       _g_.$ = _g_.jQuery;
	     }
	     retval.resolve();
	   },
	   '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js');
       }
       return retval.promise();
     };
   _g_.LMD.MessageBus = function() {
     return _g_.LMD.$({});
   }
   _g_.LMD.get_data =
     function(endpoint, data) {
       var req = _g_.LMD.$.ajax({
		   url: _g_.LMD.api_domain+'/'+endpoint,
		   data: data,
		   dataType: _g_.LMD.cross_domain ? 'json' : 'jsonp'});
       return req;
     };
}(this));