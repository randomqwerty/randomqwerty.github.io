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
			
		// Generate path to JSON file
		var jsonPath = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server + "/stc/" + file + ".json";
		var jsonPath2 = "https://raw.githubusercontent.com/randomqwerty/GFLData/main/" + server2 + "/stc/" + file + ".json";
		
		if (server == server2) {
			alert("Error: selected servers are the same");
		}
		else {		
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
			
			// Compute delta
			var delta = jsondiffpatch.diff(left, right);

			// Create visual diffs
			document.getElementById('visual').innerHTML = jsondiffpatch.formatters.html.format(delta, left);
			
			
			if (document.getElementById('showUnchanged').checked) {
				jsondiffpatch.formatters.html.showUnchanged();
            }
			else {
				jsondiffpatch.formatters.html.hideUnchanged();
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