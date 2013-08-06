// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.
var objectDepth = function(object) {
    var level = 1;
    var key;
    for(key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if(typeof object[key] == 'object'){
            var depth = objectDepth(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
}

function add_section(item_level, current_level, title, node) {
	var level_count = 0,
		return_json = "";
	if (section_counter !== 0) {
		if (item_level === current_level) {
			return_json += "},";
		} else if (item_level > current_level && item_level === (current_level+1)) {
			return_json += ", \"sections\": [";
		} else if (item_level < current_level) {
			for (level_count=1; level_count<=(current_level-item_level); level_count++) {
				return_json += "}]";
			}
			return_json += "},"
		} else { return_json = false; }
	} else {
		if (item_level === current_level) {
			return_json += "";
		} else { return_json = false; }
	}
	
	if (return_json !== false) {
		return_json += "{\"title\": \"" + title + "\", \"node\": \"" + node + "\"";
		section_counter++;
	}
	return return_json;
}
function end_json_string(current_level) {
	var level_count = 0,
		return_json = "";
	for (level_count = 1; level_count <= current_level; level_count++) {
		return_json += "}]";
	}
	return_json += "}";
	return return_json;
}
function build_drilldown_html(data) {
	var html = "";
	if (data.sections && data.sections.length > 0) {
		html += "<ul>";
		for (key in data.sections) {
			if (data.sections.hasOwnProperty(key)) {
				section = data.sections[key]
				html +="<li><a href=\"#\" data-value=\"" + section.node + "\">" + section.title + "</a>";
				if (section.sections && section.sections.length > 0) {
					//Possible stack overflow... oh well...
					html += build_drilldown_html(section);
				}
				html += "</li>";
			}			
		}
		html += "</ul>";	
	}
	return html;
}
var section_counter = 0;
var json_string="{\"sections\": [";
var json_data = null;
var html_string = "";

$(function() {
	var current_level=1;
	$('.form-item-workbench-access select option').each(function() {
		var temp_text = $(this).text(),
			temp_node = $(this).attr("value"),
			temp_match = null,
			temp_level = 0,
			temp_json = false,
			temp_title = "",
			return_value = true;
		if (temp_text.length > 0) {
			temp_match = temp_text.match(/^\-[\-]*\s/i);
			if (temp_match !== null) {
				if (typeof temp_match === "object" && temp_match.length > 0) {
					if (typeof temp_match[0] === "string") {
						temp_level = temp_match[0].replace(/\s/i, "").length;
						temp_title = temp_text.replace(temp_match[0], "");
						// Add level
						temp_json = add_section(temp_level, current_level, temp_title, temp_node);
						if (temp_json) { 
							json_string += temp_json;
							current_level = temp_level;
						} else {
							json_string += end_json_string(current_level);
							return_value = false;
						}						
					}
				}
			}
		}
		return return_value;
	});
	json_string += end_json_string(current_level);
	json_data = JSON.parse(json_string);
	html_string = build_drilldown_html(json_data);
	$('.form-item-workbench-access').append(build_drilldown_html(json_data)).find('select').hide();

	
});
