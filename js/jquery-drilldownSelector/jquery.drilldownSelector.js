/**** 
*  jQuery Drilldown Selector
*  A jQuery plugin for turning the Drupal Workbench Access Sections in to a Drilldown menu.
*  version: 1.0.0
*  author: Sean Metzgar
****/
(function ($) {
    "use strict";
    $.drilldownSelector = function (element, options) {
        /** Variable Definitions **/
        var plugin = this,
            buildVars = {},
            internal = {};
        /** Public Variables **/
        plugin.version = "1.0.0";
        /** Build Variables **/
        buildVars = {
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
        internal.jsonString = "{\"sections\": [";
        internal.jsonData = null;
        internal.htmlString = "";
        /** Internal Settings Declaration **/
        internal.settings = {};
        /** Internal Methods **/
        internal.methods = {
            /** Constructor Methods **/
            buildFramework: function () {
                internal.$container = $("<div class=\"" + internal.settings.containerClass + "\"></div>").insertAfter(internal.$element);
                internal.$nav = $("<div class=\"" + internal.settings.navClass + "\"></div>").appendTo(internal.$container);
                internal.$navBack = $("<a href=\"#\" class=\"" + internal.settings.navBackClass + "\">" + internal.settings.navBackText + "</a>").appendTo(internal.$nav);
                internal.$navHome = $("<a href=\"#\" class=\"" + internal.settings.navHomeClass + "\">" + internal.settings.navHomeText + "</a>").appendTo(internal.$nav);
                internal.$loader = $("<p class=\"" + internal.settings.loaderClass + "\">" + internal.settings.loaderText + "</p>").appendTo(internal.$container);
                internal.$menu = $("<div class=\"" + internal.settings.menuClass + "\"></div>").appendTo(internal.$container);
            },
            buildJSON: function () {
                internal.$element.find("option").each(function () {
                    var tempTextNode = $(this).text(),
                        tempValue = $(this).attr("value"),
                        tempMatch = null,
                        tempLevel = 0,
                        tempJson = false,
                        tempText = "",
                        tempSelected = $(this).is(":selected") ? true : false,
                        rVal = true;
                    if (tempSelected) {
                        if (!buildVars.hasSelected) {
                            buildVars.hasSelected = true;
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
                                        internal.jsonString += tempJson;
                                        buildVars.currentLevel = tempLevel;
                                    } else {
                                        internal.jsonString += internal.methods.endJSON();
                                        rVal = false;
                                    }
                                }
                            }
                        }
                    }
                    return rVal;
                });
                internal.jsonString += internal.methods.endJSON();
                internal.jsonData = JSON.parse(internal.jsonString);
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
                            html += "<li" + ((section.selected === true) ? " class=\"selected\"" : "") + "><a href=\"#\" data-value=\"";
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
            buildMenu: function () {
                internal.htmlString = internal.methods.buildHTML(internal.jsonData);
                internal.$menu.append(internal.htmlString);
            },
            /** JSON Helper Methods **/
            addSection: function (itemLevel, text, value, selected) {
                var levelCount = 0,
                    json = "";
                if (buildVars.sectionCounter !== 0) {
                    if (itemLevel === buildVars.currentLevel) {
                        json += "},";
                    } else if (itemLevel > buildVars.currentLevel && itemLevel === (buildVars.currentLevel + 1)) {
                        json += ", \"sections\": [";
                    } else if (itemLevel < buildVars.currentLevel) {
                        for (levelCount = 1; levelCount <= (buildVars.currentLevel - itemLevel); levelCount = levelCount + 1) {
                            json += "}]";
                        }
                        json += "},";
                    } else { json = false; }
                } else {
                    if (itemLevel === buildVars.currentLevel) {
                        json += "";
                    } else { json = false; }
                }
                if (json !== false) {
                    json += "{\"text\": \"" + text + "\", \"value\": \"" + value + "\", \"selected\": " + (selected ? "true" : "false");
                    buildVars.sectionCounter = buildVars.sectionCounter + 1;
                }
                return json;
            },
            endJSON: function () {
                var levelCount = 0,
                    json = "";
                for (levelCount = 1; levelCount <= buildVars.currentLevel; levelCount = levelCount + 1) {
                    json += "}]";
                }
                json += "}";
                return json;
            },
            /** HTML Helper Methods **/
            addClasses: function () {
                var $activeCheckbox = internal.$menu.find("li.selected");
                internal.$menu.find("li").each(function () {
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
            /** Core Functionality Methods **/
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
                    $parentLi = $checkbox.parent("a").parent("li"),
                    value = $parentA.attr("data-value");
                internal.methods.deselectCheckbox();
                $parentLi.addClass("selected");
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
            checkBackButton: function () {
                if (internal.$menu.children("ul").hasClass("active")) {
                    internal.$navBack.hide();
                } else {
                    internal.$navBack.show();
                }
            },
            /** Helper Methods **/
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
            fixHeight: function () {
                internal.$menu.height(internal.$menu.find(".active").height());
            }
        };
        /** Initialization Method **/
        plugin.init = function () {
            internal.settings = $.extend({}, internal.defaults, options);
            internal.$element.hide();
            internal.methods.buildFramework();
            internal.methods.showLoader();
            if (window.setTimeout) {
                window.setTimeout(function () {
                    internal.methods.buildJSON();
                    internal.methods.buildMenu();
                    internal.methods.addClasses();
                    internal.methods.addCheckboxes();
                    internal.methods.addListeners();
                    internal.methods.checkBackButton();
                    internal.methods.showSelector();
                    internal.methods.fixHeight();
                }, 1000);
            } else {
                internal.methods.buildJSON();
                internal.methods.buildMenu();
                internal.methods.addClasses();
                internal.methods.addCheckboxes();
                internal.methods.addListeners();
                internal.methods.checkBackButton();
                internal.methods.showSelector();
                internal.methods.fixHeight();
            }
        };
        /** Get Current Value Method **/
        plugin.getValue = function () {
            var rVal = false,
                tempVal = internal.$element.val();
            switch (typeof tempVal) {
            case "string":
                rVal = tempVal;
                break;
            case "object":
                if (tempVal.length > 0) {
                    rVal = tempVal[0];
                } else { rVal = false; }
                break;
            default:
                rVal = false;
            }
            return rVal;
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