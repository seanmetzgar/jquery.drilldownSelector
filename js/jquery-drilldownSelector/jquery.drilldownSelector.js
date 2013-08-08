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
            htmlString: "",
            hasSelected: false
        };
        /** Default Settings **/
        internal.defaults = {
            containerClass: "drilldownSelectorContainer",
            loaderClass: "drilldownSelectorLoader",
            loaderText: "Loading...",
            menuClass: "drilldownSelectorMenu",
            navClass: "drilldownSelectorNav",
            navBackClass: "back",
            navBackText: "Back",
            navHomeClass: "home",
            navHomeText: "Home",
            hasSubsClass: "hasSubs",
            goBackClass: "goBack",
            checkboxClass: "checkbox"
        };
        /** Elements / jQuery Objects **/
        internal.$element = $(element);
        internal.element = element;
        internal.$container = null;
        internal.$loader = null;
        internal.$menu = null;
        internal.$nav = null;
        internal.$navBack = null;
        internal.$navHome = null;
        /** Internal Settings Declaration **/
        internal.settings = {};
        /** Internal Methods **/
        internal.methods = {
            generateContainer: function () {
                internal.$container = $("<div class=\"" + internal.settings.containerClass + "\"></div>").insertAfter(internal.$element);
                internal.$nav = $("<div class=\"" + internal.settings.navClass + "\"></div>").appendTo(internal.$container);
                internal.$navBack = $("<a href=\"#\" class=\"" + internal.settings.navBackClass + "\">" + internal.settings.navBackText + "</a>").appendTo(internal.$nav);
                internal.$navHome = $("<a href=\"#\" class=\"" + internal.settings.navHomeClass + "\">" + internal.settings.navHomeText + "</a>").appendTo(internal.$nav);
                internal.$loader = $("<p class=\"" + internal.settings.loaderClass + "\">" + internal.settings.loaderText + "</p>").appendTo(internal.$container);
                internal.$menu = $("<div class=\"" + internal.settings.menuClass + "\"></div>").appendTo(internal.$container);
                
            },
            showLoader: function () {
                internal.$container.show();                
                internal.$nav.hide();
                internal.$menu.hide();
                internal.$loader.show();
            },
            showSelector: function () {
                internal.$container.show();
                internal.$loader.hide();
                internal.$nav.show();
                internal.$menu.show();
            },
            addSection: function (itemLevel, text, value, selected) {
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
                    json += "{\"text\": \"" + text + "\", \"value\": \"" + value + "\", \"selected\": " + (selected ? "true":"false");
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
                            html += "<li" + ((section.selected === true) ? " class=\"selected\"":"") + "><a href=\"#\" data-value=\"";
                            html += section.value + "\">" + section.text + "</a>";
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
            	var $activeCheckbox = internal.$menu.find("li.selected");
            	internal.$menu.find("li").each(function() {
            		if ($(this).find("ul").length > 0) {
            			$(this).addClass(internal.settings.hasSubsClass);
            		}
            	});
            	
            	if ($activeCheckbox.length === 0) {
            		internal.$menu.children("ul").addClass("active");
            	} else if ($activeCheckbox.length === 1) {
            		$activeCheckbox.parent("ul").addClass("active");           		
            	} else {
            		$activeCheckbox.removeClass("selected");
            		internal.$menu.children("ul").addClass("active");
            	}
            	internal.methods.fixHeight();
            	internal.methods.checkBackButton();
            },
            addCheckboxes: function () {
            	var $currentCheckbox = null;
            	internal.$menu.find("li").each(function () {
            		if (!isNaN($(this).children("a").attr("data-value"))) {
            			$(this).children("a").append("<span class=\"checkbox\">&nbsp;</span>");
            		}
            	});
            	$currentCheckbox = internal.$menu.find(".selected .checkbox").eq(0);
            	if ($currentCheckbox.length === 1) {
            		internal.methods.selectCheckbox($currentCheckbox);
            	}
            },
            addListeners: function () {
            	internal.$menu.find("a").click(function (e) {
            		var $parentLi = null;
            		e.preventDefault();
            		$parentLi = $(this).parent("li");
            		internal.methods.goForward($parentLi);
            	});
            	internal.$menu.find(".checkbox").click(function (e) {
            		e.preventDefault();            		
            		e.stopPropagation();
            		if ($(this).parents("li").eq(0).hasClass("selected")) {
            			internal.methods.deselectCheckbox();
            		} else { 
            			internal.methods.selectCheckbox($(this)); 
            		}
            	});
            	internal.$navBack.click(function (e) {
            		e.preventDefault();
            		internal.methods.goBack(false);
            	});
            	internal.$navHome.click(function (e) {
            		e.preventDefault();
            		internal.methods.goBack(true);
            	});
            },
            deselectCheckbox: function () {
            	internal.$element.find("option:selected").prop("selected", false);
            	internal.$menu.find("li").removeClass("selected");
            },
            selectCheckbox: function ($checkbox) {
        		var $parentA = $checkbox.parent("a"),
        		    $parentLi = $parentA.parent("li"),
        		    value = $parentA.attr("data-value");
        		internal.methods.deselectCheckbox();
        		$checkbox.parent("a").parent("li").addClass("selected");
        		internal.$element.find("option[value=" + value + "]").prop("selected", true);	
            },
            goBack: function (home) {
            	home = (typeof home === "boolean") ? home : false;
				internal.methods.deselectCheckbox();
				if (home) {
					internal.$menu.find(".active").removeClass("active");
					internal.$menu.children("ul").addClass("active");	
				} else {
					internal.$menu.find(".active").removeClass("active").parents("ul:eq(0)").addClass("active");	
				}
				internal.methods.fixHeight();				
        		internal.methods.checkBackButton();
           	},
            goForward: function ($li) {
           		if ($li.hasClass(internal.settings.hasSubsClass)) {
        			internal.methods.deselectCheckbox();
        			internal.$menu.find(".active").removeClass("active");
        			$li.children("ul").addClass("active");
        			internal.methods.fixHeight();
        			internal.methods.checkBackButton();
        		}
            },
            fixHeight: function () {
            	internal.$menu.height(internal.$menu.find(".active").height());
            },
            checkBackButton: function () {
            	if (internal.$menu.children("ul").hasClass("active")) {
            		internal.$navBack.hide();
            	} else {
            		internal.$navBack.show();
            	}
            }
            
        };
        plugin.init = function () {
            internal.settings = $.extend({}, internal.defaults, options);

            //internal.$element.hide();
            internal.methods.generateContainer();
            internal.methods.showLoader();

            internal.$element.find("option").each(function () {
                var tempTextNode = $(this).text(),
                    tempValue = $(this).attr("value"),
                    tempMatch = null,
                    tempLevel = 0,
                    tempJson = false,
                    tempText = "",
                    tempSelected = $(this).is(":selected") ? true:false,
                    rVal = true;
                if (tempSelected) {
                	if (!plugin.vars.hasSelected) {
                		plugin.vars.hasSelected = true;
                	} else {
                		tempSelected = false;
                	}
                }
                if (tempTextNode.length > 0) {
                    tempMatch = tempTextNode.match(/^\-[\-]*\s/i);
                    if (tempMatch !== null) {
                        if (typeof tempMatch === "object" && tempMatch.length > 0) {
                            if (typeof tempMatch[0] === "string") {
                                tempLevel = tempMatch[0].replace(/\s/i, "").length;
                                tempText = tempTextNode.replace(tempMatch[0], "");
                                // Add level
                                tempJson = internal.methods.addSection(tempLevel, tempText, tempValue, tempSelected);
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
            internal.methods.addCheckboxes();
            internal.methods.addListeners();
            internal.methods.checkBackButton();
            internal.methods.showSelector();
            internal.methods.fixHeight();
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