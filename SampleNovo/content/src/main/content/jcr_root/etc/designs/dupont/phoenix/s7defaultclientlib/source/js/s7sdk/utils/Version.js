if (!s7sdk.Version) {
	s7sdk.Version = {
		version : "2.5.2",
		build : "182679"
	};
	(function() {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "Adobe Scene7 Viewer SDK %0 (%1)",
				s7sdk.Version.version, s7sdk.Version.build)
	})()
};