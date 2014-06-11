<%--
  ==============================================================================

  Includes content jsps (breadcrumb, utility links, main content, and disclaimer).

  ==============================================================================

--%><%@ include file="/apps/dupont/phoenix/components/common/global.jsp" %><%

%><div id="main-container">
    <div class="breadcrumb padding-left group">
    <cq:include path="breadcrumb" resourceType="dupont/phoenix/components/breadcrumb"/>
    </div>
    <cq:include script="utilitylinks.jsp"/>
    <cq:include script="maincontent.jsp"/>
</div>
