(function(_g_) {
   var type   = 'grid';
   var column_info = undefined;

   // Helper functions
   if (!_g_['LMD']) {
     _g_.LMD = {
       js_root: 'http://radiant-brook-7344.herokuapp.com',
       handler: false,
       inject_script: function(error_callback, callback, script_path) {
	 var head = document.getElementsByTagName('head')[0];
	 var script = document.createElement('script');
	 script.setAttribute('type', 'text/javascript');
	 script.setAttribute('src', script_path);
	 script.onload = function() {
	   callback();
	   head.removeChild(script);
	   script = null;	   
	 }
	 script.onerror = function() {
	   error_callback();
	   alert('Could not download script'+script_path);	   
	 }
	 script.onreadystatechange = function(r) {
	   // This is not enough for old IEs, but let it stand for the time being
	   if (script.onreadystatechange != undefined) {
	     if (script.readyState == 'loaded' ||
		 script.readyState == 'complete') {
		   callback();
		   head.removeChild(script);
		   script = null;	   
	     } else {
	       error_callback();
	     }
	   }
	 }
	 head.appendChild(script);
       }
     };
   }
   
   // This needs to be here and cannot be in the handler
   var find_script = function() {
     var scripts = document.getElementsByTagName('script');
     return scripts[scripts.length-1];
   }
   var me = find_script();

   var get_data = function(bus, endpoint, attributes) {
     var req = _g_.LMD.get_data(endpoint, attributes);
     req.done(function(res) {
		bus.trigger('column:row', [res['columns']]);
		for (data in res['data']) {
		  bus.trigger('data:'+res['data'][data]['symbol'], [res['data'][data]])
		}
	      });
     if ('poll' in attributes) {
       setTimeout(function() { get_data(bus, endpoint, attributes); }, attributes['poll']);
     }
   }

   var row = function(bus, symbol, el) {
     bus.on('data:'+symbol,
     function(_, data) {
       var tr = '<tr data-lmd-row-id="'+data['symbol']+'">'
       for (d in data) {
	 var content = ""
	 var cell_type = column_info[d].type;
	 if (cell_type === 'string')
	   content = data[d]
	 else if (cell_type === 'ccy')
	   content = data[d].toFixed(5);
	 else if (cell_type === 'float')
	   content = data[d].toFixed(5);
	 else if (cell_type === 'int')
	   content = data[d]
	 tr += '<td class="lmd_grid_cell_' + cell_type + '">'+content+'</td>'
       }
       tr += '</tr>'
       var next_el = _g_.LMD.$(tr);
       el.replaceWith(next_el);
       el = next_el;
     });
   }

   var table = function(bus, attributes, dom) {
     var set = attributes['set'].split(',');
     _g_.LMD.$(dom['inner_wrapper']).html('<table class="lmd_grid_table"><thead></thead><tbody></tbody></table>');
     var rows = [];
     for (s in set) {
       var el = _g_.LMD.$('<tr></tr>');
       _g_.LMD.$('table tbody', dom['inner_wrapper']).append(el);
       rows.push(new row(bus, set[s], el));
     }
     bus.on('column:row', function(event, columns) {
	      // We got the table rows, render the table
	      var head = "<tr>";
	      column_info = columns;
	      for (i in columns)
		head += '<th>' + columns[i]['name'] + '</th>';
	      head += "</tr>"
	      _g_.LMD.$("table thead", dom['inner_wrapper']).append(head);
	      bus.unbind(event);
	    });
     get_data(bus, 'data', attributes);
   }

   var setup = function() {
     var attributes = _g_.LMD.get_attributes(me);
     var bootstrap_dom = _g_.LMD.bootstrap_dom(attributes, type);
     me.parentNode.replaceChild(bootstrap_dom['wrapper'], me);
     me = null;
     var jquery_promise = _g_.LMD.insure_jquery();
     jquery_promise.then(
       function() {
	 var bus = new _g_.LMD.MessageBus();
	 table(bus, attributes, bootstrap_dom);
       });
   }

   if (!_g_.LMD.handler) {
     var path = _g_.LMD.js_root+'/handler.js';
     _g_.LMD.inject_script(function() { alert("Could not load script"); },
       function() {
	 setup();
       }, path);
   } else {
     setup();
   }

}(this));