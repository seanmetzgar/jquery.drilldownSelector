function setMenuParent() {
    "use strict";
    var tVal = false,
        nodeValue = jQuery(".form-item-workbench-access select").val(),
        menuParent = null,
        menuParentValue = null;
    switch (typeof nodeValue) {
    case "string":
        tVal = nodeValue;
        break;
    case "object":
        if (nodeValue.length > 0) {
            tVal = nodeValue[0];
        } else { tVal = false; }
        break;
    default:
        tVal = false;
    }
    if (tVal) {
        menuParent = jQuery(".form-item-menu-parent select");
        menuParentValue = menuParent.find("option[value$=\":" + tVal + "\"]:eq(0)").attr("value");
        menuParent.val(menuParentValue);
    }
}

jQuery(function () {
    "use strict";
    setMenuParent();
    jQuery(".form-item-workbench-access select").drilldownSelector({onChange: function () { setMenuParent(); }});
});