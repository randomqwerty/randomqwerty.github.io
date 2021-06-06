	$(document).ready(function(){
			// Populate JSON selector with list of files
			var selectFile = document.getElementById("selectFile");
			for(var i = 0; i < jsonNames.length; i++) {
				var opt = jsonNames[i];
				var el = document.createElement("option");
				el.textContent = opt;
				el.value = opt;
				selectFile.appendChild(el);
			};

			// Get query strings
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			var server = urlParams.get("server");
			var file = urlParams.get("file");

			if (file != null && server != null) {
				LoadData(server, file);
				$("#selectServer").val(server);
				$("#selectFile").val(file);
			};
	});
	
	function UpdateData() {
			// Grab selected server
			var e = document.getElementById("selectServer");
			var server = e.options[e.selectedIndex].value;
					
			// Grab selected JSON file name
			e = document.getElementById("selectFile");
			var file = e.options[e.selectedIndex].value;
			
			// Load table
			LoadData(server, file);
			
			// Update URL with new query strings
			var baseURL = window.location.href.split('?')[0];
			var newURL = baseURL + "?server=" + server + "&file=" + file;
			window.history.pushState('obj', 'Title', newURL);
		}

		function LoadData(server, file) {
			// Generate path to JSON file
			var jsonPath = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server + "/stc/" + file + ".json";
					
			// Load JSON file and generate table
			$.getJSON(jsonPath, function(data){
						
				// Dynamically generate array of column names
				var columns = [];
				columnNames = Object.keys(data[0]);
				for (var i in columnNames) {
					columns.push({data: columnNames[i], title: columnNames[i]});
				}
						
				// Check if DataTable exists and delete if it does
				if ($.fn.DataTable.isDataTable('#container')) {
					$('#container').DataTable().destroy();
					$("#container tr").remove();
				} 
						
				// Create table
				table = $('#container').DataTable({
					"data": data,
					"columns": columns,
					"order": [],
					"pageLength": 100, // show 100 entries by default
					"dom": "QBlfrtip", // load SearchBuilder for custom searches
					"fixedHeader": true, // always show headers
					"autoWidth": false, // disable autoresize when columns hidden
					"columnDefs": [{ // show ellipses for items over 20 characters long
						"targets": "_all",
						"data": data,
						"render": function(data, type, row) {
							if ( type === 'display') {
								return renderedData = $.fn.dataTable.render.ellipsis(20)(data, type, row);            
							}
							return data;
						}
					}],
					"buttons": [{ // buttons to show/hide columns
						extend: 'colvis',
						collectionLayout: 'fixed four-column'
					}]
					// }],
					/* Figure out later
					"searchBuilder": {
						"conditions": {
							"string": {
								"contains": {
									"conditionName": "Contains",
									"init": function (that, fn, preDefined = null) {
										// Create input element and add the classes to match the SearchBuilder styles-
										let el = $('<input/>')
											.addClass(that.classes.input)
											.addClass(that.classes.value)
				 
										// Add the listener for the callback search function
										el.on('input', function() {fn(that, el)});
				 
										// Set any preDefined values
										if (preDefined !== null) {
											el.val(preDefined[0]);
										}
										return el;
									},
									"inputValue": function (el) {
										// return the value in the input element
										return [$(el[0]).val()];
									},
									"isInputValid": function(el, that) {
										// check that text is entered
										return $(el[0]).val().length > 0
									},
									"search": function (value, comparison, that) {
										return comparison.toLowerCase().includes(value.toLowerCase());
									}
								}
							}
						}
					}
					*/
				});
						
				// add tooltips for entires with ellipses
				$('tbody').on('click', 'tr', function() {
				$(this).children('td:eq(1)').text(table.row( this ).data()[1]);
				table.cell(this, 1).invalidate('dom');
				});
			});
		};
			