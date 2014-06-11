<%@ include file="/apps/dupont/phoenix/components/common/global.jsp" %><%
%><%@ page import="com.dupont.phoenix.list.ListItem, com.dupont.phoenix.Global, java.util.List,com.day.cq.wcm.foundation.Image" %><%
    //TODO: Here we should display:
    //One third page width -> Short Description 2 [302 characters]
    //width=300 & height=150
    ListItem  item = (ListItem)request.getAttribute("item");
    Image image = item.getThumbnail();
%>
<% 
    item.setImageWidth("300");
    item.setImageHeight("150");
    if (image != null && image.hasContent()) {
%>
<div class="hlm-image">
<a class="<%=Global.getEventTrackingClassName(resource)%>" href="<%=item.getLinkURL()%>">
<%
    image.draw(out);
 %></a></div>
 <h2><a class="<%=Global.getEventTrackingClassName(resource)%>" href="<%=item.getLinkURL()%>"><%=item.getTextWithoutLastWord(item.getLinkText())%> <span class="no-wrap"><%=item.getTextLastWord(item.getLinkText())%><img src="/etc/designs/dupont/phoenix/clientlibs/source/images/right-arrow-action.png" class="cta-arrow"></span></a></h2>
    <% } else {
    %>
    <h2><a class="<%=Global.getEventTrackingClassName(resource)%>" href="<%=item.getLinkURL()%>"><%=item.getTextWithoutLastWord(item.getLinkText())%> <span class="no-wrap"><%=item.getTextLastWord(item.getLinkText())%><img src="/etc/designs/dupont/phoenix/clientlibs/source/images/right-arrow-action.png" class="cta-arrow"></span></a></h2>    
    <!-- <div class="author"><%=item.getAuthor()%></div>  -->
    <p><%=item.getShortDesc()%></p>
<%} %>