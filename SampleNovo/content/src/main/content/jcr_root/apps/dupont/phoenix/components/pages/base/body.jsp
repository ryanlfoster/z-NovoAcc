<%--
  ==============================================================================

  Includes header, content, and footer jsps.

  ==============================================================================

--%><%@ include file="/apps/dupont/phoenix/components/common/global.jsp"%>
<%@ page import="com.day.cq.wcm.api.WCMMode,com.day.cq.wcm.foundation.Image,com.dupont.phoenix.commons.Scene7Image,org.apache.sling.api.resource.Resource,com.dupont.phoenix.Global" %><%
%><body><%
if(WCMMode.fromRequest(request) != WCMMode.DISABLED) {
	if(Global.isEdit(slingRequest)) {
		Image heroImage = new Scene7Image(resource, "thumbnail", slingRequest);
	}
%><cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/><%
}%><div id="bg-container">
		<cq:include script="cookiealert.jsp"/>
		<cq:include script="header.jsp"/>
		<cq:include script="content.jsp"/>
		<cq:include script="footer.jsp"/>
	</div><% if(WCMMode.fromRequest(request) == WCMMode.DISABLED) {
%><cq:include path="clientcontext" resourceType="cq/personalization/components/clientcontext"/><%
}%><cq:includeClientLib js="apps.dupont.main.v2.5"/>
	<cq:include path="cloudservices" resourceType="cq/cloudserviceconfigs/components/servicecomponents"/>
	<cq:includeClientLib categories="dupont.sitecatalyst"/>	
<% if(WCMMode.fromRequest(request) == WCMMode.DISABLED) {
%><cq:includeClientLib categories="cq.shared"/><%
}%>	
</body>
