	$(document).ready(function(){	
			// Populate JSON selector with list of files, remove blank option
			var selectFile = document.getElementById("selectFile");
			for(var i = 0; i < jsonNames.length; i++) {
				var opt = jsonNames[i];
				var el = document.createElement("option");
				el.textContent = opt;
				el.value = opt;
				selectFile.appendChild(el);
			};
			selectFile.remove(0);

			// Get query strings from URL
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			var server = urlParams.get("server");
			var file = urlParams.get("file");
			
			// Load data if query strings are not blank
			if (file != null && server != null) {
				LoadData(server, file);
				
				// update server and JSON selectors
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
			
			// Update URL with new query strings if applicable
			var newURL;
			var baseURL = window.location.href.split('?')[0];
			if (server.length != 0 && file.length != 0) {
				newURL = baseURL + "?server=" + server + "&file=" + file;
			} else {
				newURL = baseURL;
			};
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
				
				// Check if DataTable already exists and delete if it does
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
					"lengthMenu": [[10, 25, 50, 100, -1], [10,25, 50, 100, "All"]],
					"dom": "QBlfrtip", // load SearchBuilder for custom searches
					"fixedHeader": true, // always show headers when scrolling
					"autoWidth": false, // disable autoresize when columns hidden
					"select": true, // initialize select extension to highlight rows
					"columnDefs": [
						{ // change columns to strings to allow for doesn't/does contain filters
							"type": "string",
							"targets": "_all",
						},
					],
					"buttons": [
						{ // buttons to show/hide columns
							extend: 'colvis',
							collectionLayout: 'fixed four-column'
						},
						'copy',
						{ // button to export to Excel
							extend: 'excelHtml5',
							filename: server + "_" + file,
							title: '',
							exportOptions: {
								columns: ':visible', // export only visible columns
								format: {
									// if the data is numeric after removing all commas, replace those commas with spaces before exporting; otherwise keep it as-is
									// this is to prevent Excel from converting comma-separated lists of numbers (e.g., skill IDs) to a single large number
									body: function(data, row, column, node) {
										data = $('<p>' + data + '</p>').text();
										return $.isNumeric(data.replaceAll(',', '')) ? data.replaceAll(',', ' ') : data;
									}
								}
							}
						}
					],
					"searchBuilder": { // custom search builder
						"conditions": {
							"string": {
								"!contains": {  // filters for strings that do not contain the input
									"conditionName": "Does Not Contain",
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
										return !value.includes(comparison[0].toLowerCase());
									}
								}
							}
						}
					}
				});				
			});
		};