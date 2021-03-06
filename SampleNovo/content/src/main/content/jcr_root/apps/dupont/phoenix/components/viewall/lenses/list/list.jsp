<%--
  Copyright 1997-2009 Day Management AG
  Barfuesserplatz 6, 4001 Basel, Switzerland
  All Rights Reserved.

  This software is the confidential and proprietary information of
  Day Management AG, ("Confidential Information"). You shall not
  disclose such Confidential Information and shall use it only in
  accordance with the terms of the license agreement you entered into
  with Day.

  ==============================================================================

  List Lens component

--%><%@ page import="java.util.Calendar" %>
<%
%><%@include file="/libs/foundation/global.jsp"%><%

    Long time = Calendar.getInstance().getTimeInMillis();
    String name = properties.get("name", "List");
    String dateFormat = properties.get("dateFormat", "d-M-Y H:i");
    String textCreated = properties.get("textCreated", "Created:");
    String textModified = properties.get("textModified", "Modified:");

%>
<div id="lens-list-button-wrapper-<%= time %>" class="lens-button-wrapper"></div><!--
--><script type="text/javascript">

    CQ.Ext.onLoad(function() {
        var config = {
            "xtype": "dataviewlens",
            "text": "<%= xssAPI.encodeForJSString(name) %>",
            "renderButtonTo": "lens-list-button-wrapper-<%= time %>",
            "overflow": "visible",
            "proxyConfig": {
                //"url": "/bin/wcm/contentfinder/view.json/content/dam"
            },
            "storeConfig": {
                "baseParams": {
                    "mimeType": "image"
                }
            },
            "items": {
                "cls": "lens-dataview list",
                "tpl":
                    '<table><tbody>' +
                        '<tr><td class="padding-cell top"><div /></td></tr>' +
                        '<tpl for=".">' +
                            '<tr><td class="padding-cell"></td><td colspan="4" class="line"></td><td class="padding-cell"></td></tr>' +
                            '<tr class="item" ' +
                                ' ondblclick="CQ.shared.Util.open(\'{[CQ.shared.XSS.getXSSValue(values.path)]}.html\', null, \'contentWindow\');">' +
                                '<td class="padding-cell"><div /></td>' +
                                '<td class="thumbnail-cell"><div style="background-image:url(\'{[CQ.HTTP.externalize(values.thumbnailPath,true)]}.thumb.48.48{[values.ck ? "." + values.ck : ""]}.png\');" /></td>' +
                                '<td class="title-cell"><div><span class="title">{[CQ.shared.XSS.getXSSValue(values.title)]}</span>{[CQ.shared.XSS.getXSSValue(values.title != values.name ? values.name : "")]}</div></td>' +
                                '<td class="format-cell"><div>{[CQ.shared.XSS.getXSSValue(values.meta["dc:format"] ? values.meta["dc:format"].replace("application/", "") : "")]}</div></td>' +
                                '<td class="last"><div>' +
                                    '{[values.imageDimensions ? values.imageDimensions : ""]}' +
                                    '<br/>' +
                                    // if available show mod date, otherwise creation date
                                    '{[values.modificationDate ? ' +
                                            '"<%= xssAPI.encodeForJSString(xssAPI.encodeForHTML(textModified)) %> " + values.modificationDate.format("<%= xssAPI.encodeForJSString(dateFormat) %>") + "<br/>"' +
                                        ':' +
                                            'values.creationDate ? ' +
                                                    '"<%= xssAPI.encodeForJSString(xssAPI.encodeForHTML(textCreated)) %> " + values.creationDate.format("<%= xssAPI.encodeForJSString(dateFormat) %>") + "<br/>"' +
                                                ':' +
                                            '""]}' +
                                '</div></td>' +
                                '<td class="padding-cell"><div /></td>' +
                            '</tr>' +
                        '</tpl>' +
                        '<tr><td class="padding-cell bottom"><div /></td></tr>' +
                    '</tbody></table>',
                "itemSelector": ".item"
            },
            "listeners": {
                "afterlayout": function() {
                    var el = this.body || this.el;
                    if(el){
                        el.setOverflow("visible");
                    }
                }
            }
        };
        var lens = CQ.Util.build(config);
        CQ.search.Util.addLens(lens, "list");
    });
</script>

