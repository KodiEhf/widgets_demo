(function(__g__) {
   // Create our global
   if (!__g__.LMD) {
       __g__.LMD = {};
   }
   var load_script = function(script_path, callback) {
     var head = document.getElementsByTagName('head')[0];
     var script = document.createElement('script');
     script.setAttribute('src', script_path);
     script.onload=script.onreadystatechange = function(_) {
       callback();
       head.removeChild(script);
       script = null;
     }
     head.appendChild(script);
   }
   var start = function(callback) {
     var old_jq = undefined;
     if (__g__.LMD.$) {
       next();
     } else if (__g__.jQuery && __g__.jQuery.fn.jquery == '2.0.0') {
       __g__.LMD.$ = window.jQuery;
       next();
     } else {
       if (window.jQuery) {
	 // There is another jQuery here, not of the version we want. Let's
	 // keep it around
	 old_jq = window.jQuery.noConflict();
       }
       // It's not here. We got to download it..
       load_script('//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
	 function() {
	   __g__.LMD.$ = jQuery.noConflict();
	   if (old_jq) {
	     // there is another jQuery around here, give it back
	     __g__.jQuery = old_jq.noConflict();
	     __g__.$ = __g__.jQuery;
	   }
	   callback();
	 });
     }
   }

   // Find all scripts
   var scripts = document.getElementsByTagName("script");

   // Find the script we just loaded. Since scripts are loaded and run syncly this should
   // return the last once. Keep in mind this does not work if we load scripts asyncly.
   var me           = scripts[scripts.length -1];
   var lang         = me.getAttribute('lang') != null ? me.getAttribute('lang') : 'en';
   var title        = me.getAttribute('data-title');
   var set          = me.getAttribute('data-set');
   var width        = me.getAttribute('data-width');
   var key          = me.getAttribute('data-key');
   var poll         = me.getAttribute('data-poll');
   var api_domain   = 'http://radiant-brook-7344.herokuapp.com';
   var cross_domain = api_domain.indexOf(location.host) != -1;
   var table_ready  = false;
   var columns      = undefined;
   
   // Lets start by rending 'Loading'
   var new_div = document.createElement('div');
   new_div.setAttribute('style', 'width: '+width+'px;');
   new_div.setAttribute('class', 'LMD_embed LMD_grid');
   new_div.setAttribute('lang', lang);
   if (title) {
     var headline = document.createElement('h1');
     headline.setAttribute('class', 'LMD_grid_title');
     headline.appendChild(document.createTextNode(title));
     new_div.appendChild(headline);
   }
   var wrapper = document.createElement('div');
   wrapper.setAttribute('class', 'LMD_grid_embed');
   var loading_text = document.createElement('strong');
   loading_text.setAttribute('class', 'LMD_loading');
   if (lang == 'en') {
     loading_text.appendChild(document.createTextNode("Loading data"));
   } else if (lang == 'is') {
     loading_text.appendChild(document.createTextNode("Hleð gögnum"));
   }
   wrapper.appendChild(loading_text);
   new_div.appendChild(wrapper);
   me.parentNode.replaceChild(new_div, me);
   var el = new_div;
   me = null;

   // I'm going to want to use jQuery. Get it or check if it's already here.
   var work = function() {
     var $ = __g__.LMD.$;
     // Now go fetch the data
     var req = $.ajax({url: api_domain+'/data',
		       data: {set: set, key: key, lang: lang},
		       dataType: cross_domain ? 'json' : 'jsonp'});

     // Excellent, data is here. Render it. We should probably use some sort
     // of a template system here.
     req.done(
       function(d) {
	 // We don't want to bootstrap the el more then once
	 if (table_ready === false) {
	   var head = "";
	   for (i in d['columns']) {
	     head += '<th>' + d['columns'][i]['name']+'</th>';
	   }
	   var table_data = '<table class=\"LMD_grid_table"><thead class="LMD_grid_thead"><tr>'+head+'</tr></thead><tbody class="LMD_grid_tbody"></tbody></table>';
	   $(loading_text).replaceWith(table_data);
	   table_ready = true;
	   columns = d['columns'];
	 }

	 // Load the data
	 for (i in d['data']) {
	   var row = d['data'][i];

	   // Find if there is a row for 'this data'. This is currently expensive, we
	   // should look into optimizing here
	   var row_el = $('table tbody tr[data-id="'+row['symbol']+'"]', wrapper);
	   if (row_el.length === 0) {
	     var row_el = $('<tr data-id="'+row['symbol']+'"></tr>');
	     $('table tbody', wrapper).append(row_el);
	   }

	   // I know this stuff isn't pretty
	   var row_data = ""
	   for (column in columns) {
	     var cell_type = columns[column]['type'];
	     var content = row[column];
	     if (cell_type == 'ccy') {
	       content = content.toFixed(5);
	     } else if (cell_type == 'float') {
	       content = content.toFixed(5);
	     }
	     row_data += '<td class="LMD_grid_cell_'+cell_type+'">'+content+'</td>'
	   }
	   $('table tbody tr[data-id="'+row['symbol']+'"]', wrapper).html(row_data);
	 }
	 // Primative polling!
	 if (poll) {
	   setTimeout(function() { work() }, poll);
	 }
       });
   }

   start(function() { work() } );
}(this));