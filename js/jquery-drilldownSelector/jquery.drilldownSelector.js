(function ($) {
    "use strict";
    $.drilldownSelector = function (element, options) {
        /** Variable Definitions **/
        var plugin = this,
            internal = {};
        /** Public Variables **/
        plugin.vars = {
            currentLevel: 1,
            sectionCounter: 0,
            jsonString: "{\"sections\": [",
            jsonData: null,
            htmlString: ""
        };
        /** Default Settings **/
        internal.defaults = {
            containerClass: "drilldownSelectorContainer",
            loaderClass: "drilldownSelectorLoader",
            loaderText: "Loading...",
            menuClass: "drilldownSelectorMenu",
            hasSubsClass: "hasSubs",
            goBackClass: "goBack"
        };
        /** Elements / jQuery Objects **/
        internal.$element = $(element);
        internal.element = element;
        internal.$container = null;
        internal.$loader = null;
        internal.$menu = null;
        /** Internal Settings Declaration **/
        internal.settings = {};
        /** Internal Methods **/
        internal.methods = {
            generateContainer: function () {
                internal.$container = $("<div class=\"" + internal.settings.containerClass + "\"></div>").insertAfter(internal.$element);
                internal.$loader = $("<p class=\"" + internal.settings.loaderClass + "\">" + internal.settings.loaderText + "</p>").appendTo(internal.$container);
                internal.$menu = $("<div class=\"" + internal.settings.menuClass + "\"></div>").appendTo(internal.$container);
            },
            showLoader: function () {
                internal.$container.show();
                internal.$menu.hide();
                internal.$loader.show();
            },
            showSelector: function () {
                internal.$container.show();
                internal.$loader.hide();
                internal.$menu.show();
            },
            addSection: function (itemLevel, text, value) {
                var levelCount = 0,
                    json = "";
                if (plugin.vars.sectionCounter !== 0) {
                    if (itemLevel === plugin.vars.currentLevel) {
                        json += "},";
                    } else if (itemLevel > plugin.vars.currentLevel && itemLevel === (plugin.vars.currentLevel + 1)) {
                        json += ", \"sections\": [";
                    } else if (itemLevel < plugin.vars.currentLevel) {
                        for (levelCount = 1; levelCount <= (plugin.vars.currentLevel - itemLevel); levelCount = levelCount + 1) {
                            json += "}]";
                        }
                        json += "},";
                    } else { json = false; }
                } else {
                    if (itemLevel === plugin.vars.currentLevel) {
                        json += "";
                    } else { json = false; }
                }
                if (json !== false) {
                    json += "{\"text\": \"" + text + "\", \"value\": \"" + value + "\"";
                    plugin.vars.sectionCounter = plugin.vars.sectionCounter + 1;
                }
                return json;
            },
            endJSON: function () {
                var levelCount = 0,
                    json = "";
                for (levelCount = 1; levelCount <= plugin.vars.currentLevel; levelCount = levelCount + 1) {
                    json += "}]";
                }
                json += "}";
                return json;
            },
            buildHTML: function (data) {
                var html = "",
                    key = null,
                    section = null;
                if (data.hasOwnProperty("sections") && data.sections.length > 0) {
                    html += "<ul>";
                    for (key in data.sections) {
                        if (data.sections.hasOwnProperty(key)) {
                            section = data.sections[key];
                            html += "<li><a href=\"#\" data-value=\"" + section.value + "\">" + section.text + "</a>";
                            //Possible stack overflow... oh well...
                            if (section.sections && section.sections.length > 0) { html += internal.methods.buildHTML(section); }
                            html += "</li>";
                        }
                    }
                    html += "</ul>";
                }
                return html;
            },
            addClasses: function () {
            	internal.$menu.find("li").each(function() {
            		if ($(this).find("ul").length > 0) {
            			$(this).children("a").addClass(internal.settings.hasSubsClass);
            		}
            	});
            }
        };
        plugin.init = function () {
            internal.settings = $.extend({}, internal.defaults, options);

            internal.$element.hide();
            internal.methods.generateContainer();
            internal.methods.showLoader();

            internal.$element.find("option").each(function () {
                var tempTextNode = $(this).text(),
                    tempValue = $(this).attr("value"),
                    tempMatch = null,
                    tempLevel = 0,
                    tempJson = false,
                    tempText = "",
                    rVal = true;
                if (tempTextNode.length > 0) {
                    tempMatch = tempTextNode.match(/^\-[\-]*\s/i);
                    if (tempMatch !== null) {
                        if (typeof tempMatch === "object" && tempMatch.length > 0) {
                            if (typeof tempMatch[0] === "string") {
                                tempLevel = tempMatch[0].replace(/\s/i, "").length;
                                tempText = tempTextNode.replace(tempMatch[0], "");
                                // Add level
                                tempJson = internal.methods.addSection(tempLevel, tempText, tempValue);
                                if (tempJson) {
                                    plugin.vars.jsonString += tempJson;
                                    plugin.vars.currentLevel = tempLevel;
                                } else {
                                    plugin.vars.jsonString += internal.methods.endJSON();
                                    rVal = false;
                                }
                            }
                        }
                    }
                }
                return rVal;
            });
            plugin.vars.jsonString += internal.methods.endJSON();
            plugin.vars.jsonData = JSON.parse(plugin.vars.jsonString);
            plugin.vars.htmlString = internal.methods.buildHTML(plugin.vars.jsonData);
            internal.$menu.append(plugin.vars.htmlString);
            internal.methods.addClasses();
            internal.methods.showSelector();
        };
        plugin.init();
    };
    $.fn.drilldownSelector = function (options) {
        return this.each(function () {
            if (undefined === $(this).data("drilldownSelector")) {
                var plugin = new $.drilldownSelector(this, options);
                $(this).data("drilldownSelector", plugin);
            }
        });
    };
}(jQuery));