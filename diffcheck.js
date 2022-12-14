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
		var server = urlParams.get("l");
		var server2 = urlParams.get("r");
		var file = urlParams.get("file");
		var field = urlParams.get("field");
		var criteria = urlParams.get("criteria");
		var val= urlParams.get("val");
		
		// Use default file's fields if no query string
		if (file == null) {
			UpdateFieldSelector("achievement");
		}
			
		// Compare files if query strings are not blank (field/criteria/val are optional)
		if (file != null && server != null && server2 != null) {				
			// update server and JSON selectors
			$("#selectServer").val(server).change();
			$("#selectServer2").val(server2).change();
			$("#selectFile").val(file).change();
			$("#selectField").val(field).change();
			$("#selectCriteria").val(criteria).change();
			$("#filterInput").val(val).change();
			
			CompareData();
		};
	});
	
	function CompareData() {
		// Grab selected server
		var e = document.getElementById("selectServer");
		var server = e.options[e.selectedIndex].value;
		var e = document.getElementById("selectServer2");
		var server2 = e.options[e.selectedIndex].value;
		
		// Grab selected JSON file name
		e = document.getElementById("selectFile");
		var file = e.options[e.selectedIndex].value;
		
		// Grab selected field
		e = document.getElementById("selectField");
		if (e.selectedIndex != -1) {
			var field = e.options[e.selectedIndex].value;
		}
		
		// Grab selected criteria
		e = document.getElementById("selectCriteria");
		if (e.selectedIndex != -1) {
			var criteria = e.options[e.selectedIndex].value;		
		}
		
		// Grab val for comparison
		var val = String(document.getElementById("filterInput").value);
		
		// Generate path to JSON file
		var jsonPath = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server + "/stc/" + file + ".json";
		var jsonPath2 = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server2 + "/stc/" + file + ".json";
		
		if (server == server2) {
			alert("Error: selected servers are the same");
		}
		else {		
			// Update URL with new query strings if applicable
			var newURL;
			var baseURL = window.location.href.split('?')[0];
			if (server.length != 0 && server2.length && file.length != 0) {
				if (val.length != 0) {
					newURL = baseURL + "?l=" + server + "&r=" + server2 + "&file=" + file + "&field=" + field + "&criteria=" + criteria + "&val=" + val;
				}
				else {
					newURL = baseURL + "?l=" + server + "&r=" + server2 + "&file=" + file;
				}
			} else {
				newURL = baseURL;
			};
			window.history.pushState('obj', 'Title', newURL);
			
			// Load first json
			var left = (function () {
				var left = null;
				$.ajax({
					'async': false,
					'global': false,
					'url': jsonPath,
					'dataType': "json",
					'success': function (data) {
						left = data;
					}
				});
				return left;
			})();
			
			// Load second json
			var right = (function () {
				var right = null;
				$.ajax({
					'async': false,
					'global': false,
					'url': jsonPath2,
					'dataType': "json",
					'success': function (data) {
						right = data;
					}
				});
				return right;
			})();
			
			// Filter jsons by matching fields to input
			if (val.length != 0) {
				left = filterJson(left, field, criteria, val);
				right = filterJson(right, field, criteria, val);
			}
			
			// Compute delta
			var firstField = document.getElementById("selectField").options[0].value;
			var delta = jsondiffpatch.create({
				    objectHash: function(obj, index) {
					return obj[firstField];  // hash by first field in file
				}
			}).diff(left, right);

			// Create visual diffs
			document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
			
			// Show/hide unchanged values depending on user input
			if (document.getElementById('showUnchanged').checked) {
				jsondiffpatch.formatters.html.showUnchanged();
			}
			else {
				jsondiffpatch.formatters.html.hideUnchanged();
			};

			// Remove unwanted elements
			$(".jsondiffpatch-textdiff-location").remove();			
			
			// Notify user if no diffs
			if (delta === undefined) {
				alert("Files are identical.");
			}
		}
	}
	
	function showUnchanged() {
		if (document.getElementById('showUnchanged').checked) {
            jsondiffpatch.formatters.html.showUnchanged();
            }
		else {
			jsondiffpatch.formatters.html.hideUnchanged();
		}
	}
	
	function SwapServers() {
		var server = $("#selectServer").val();
		var server2 = $("#selectServer2").val();
		$("#selectServer").val(server2);
		$("#selectServer2").val(server);
	}
	
	function filterJson(data, field, criteria, val) {
		return data.filter(function (v) {
			temp = String(v[field]).toLowerCase();
			if (criteria == "equals") {
				return temp == val.toLowerCase();
			}
			else if (criteria == "not") {
				return temp != val.toLowerCase();
			}
			else if (criteria == "starts") {
				return temp.startsWith(val.toLowerCase());
			}
			else if (criteria == "notstarts") {
				return !temp.startsWith(val.toLowerCase());
			}
			else if (criteria == "contains") {
				return temp.includes(val.toLowerCase())
			}
			else if (criteria == "notcontains") {
				return !temp.includes(val.toLowerCase())
			}
		});
	}
	
	function UpdateFieldSelector(file) {
		// Filter mappings to get field names for selected file only
		var filteredmappings = mappings.filter(function (v) {
			return v.name == file;
		});
		
		// Delete any existing fields and add new ones
		var selectField = document.getElementById("selectField");		
		selectField.options.length = 0;
		for(var i = 0; i < filteredmappings[0].fields.length; i++) {
			var opt = filteredmappings[0].fields[i];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			selectField.appendChild(el);
		};
	}

	function ClearFilter() {
		$("#filterInput").val("").change();
	}
	