function setMenuParent() {
    var tVal = false;
    var nodeValue = jQuery(".form-item-workbench-access select").val();
    var menuParent = null;
    var menuParentValue = null;
    switch (typeof nodeValue) {
    case "string":
        tVal = tempVal;
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

$(function() {
	setMenuParent();
    jQuery(".form-item-workbench-access select").drilldownSelector({onChange: function () { setMenuParent(); });
});
