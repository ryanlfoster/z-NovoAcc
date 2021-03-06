<%@ include file="/apps/dupont/phoenix/components/common/global.jsp" %><%
%><%@ page import="java.util.List, com.dupont.phoenix.list.HListHelper, com.dupont.phoenix.list.ListItem, com.day.cq.wcm.foundation.Image" %><%
	//Used when there is only one item within the list and tool callout is activated.	
	//TODO: Here we should display:
	//width=300 & height=150
	HListHelper hListHelper = (HListHelper) request.getAttribute("hListHelper");
	List<ListItem> items = hListHelper.getListItems();
	ListItem item = items.get(0);
	item.setImageWidth("300");
	item.setImageHeight("150");	
	request.setAttribute("listitem", item);
	
%>
<div class="row-without-callout group"> 
<ul class="row-3col">
	<cq:include script="/apps/dupont/phoenix/components/common/listviews/listitem-image.jsp"/>
	<cq:include script="/apps/dupont/phoenix/components/common/listviews/listitem-title-and-description.jsp"/>
</ul>
</div>