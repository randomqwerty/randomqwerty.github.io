// Populate JSON selector with list of files
var selectFile = document.getElementById("selectFile");
for(var i = 0; i < jsonNames.length; i++) {
	var opt = jsonNames[i];
	var el = document.createElement("option");
	el.textContent = opt;
	el.value = opt;
	selectFile.appendChild(el);
}

function LoadData() {
	$(document).ready(function(){
			
			// Grab selected server
			var e = document.getElementById("selectServer");
			var server = e.options[e.selectedIndex].value;
			
			// Grab selected JSON file name
			e = document.getElementById("selectFile");
			var file = e.options[e.selectedIndex].value;
			
			// Generate path to JSON file
			var jsonPath = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server + "/stc/" + file + ".json"
			
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
					"fixedHeader": true,
					"columnDefs": [ { // show ellipses for items over 20 characters long
						"targets": "_all",
						"data": data,
						"render": function(data, type, row) {
							if ( type === 'display') {
								return renderedData = $.fn.dataTable.render.ellipsis(20)(data, type, row);            
							}
							return data;
							}
						}],
					"buttons": [{
							extend: 'colvis',
							collectionLayout: 'fixed two-column'
						}]
					});
				
				// show tooltips for entires with ellipses
				$('tbody').on('click', 'tr', function() {
				$(this).children('td:eq(1)').text(table.row( this ).data()[1]);
				table.cell(this, 1).invalidate('dom');
				})
			});
		});
}