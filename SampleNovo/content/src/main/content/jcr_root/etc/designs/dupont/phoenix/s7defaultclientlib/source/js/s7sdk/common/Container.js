s7sdk.pkg("s7sdk.common");
s7sdk.Util.require("s7sdk.event.Event");
if (!s7sdk.common.Container) {
	s7sdk.common.Container = function Container(a, c, b) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.CONFIG,
						"s7sdk.common.Container constructor - containerId: %0, settings: %1 , compId: %2",
						a, c, b);
		arguments.callee.superclass.apply(this,
				[ b, a, "div", "s7container", c ]);
		this.settings = c;
		this.hasCustomSize = true;
		this.container = s7sdk.Util.byId(a);
		this.wid = this.stagesize.width;
		this.hei = this.stagesize.height;
		this.vendorPrefix = this.getVendorPrefix();
		this.storedPosition = null;
		if (this.wid == 0 || this.hei == 0) {
			this.wid = this.size.width;
			this.hei = this.size.height
		}
		if (this.wid == 0 || this.hei == 0) {
			this.wid = parseInt(s7sdk.Util.css.getCss("s7container", "width",
					this.id, null, this.container));
			this.hei = parseInt(s7sdk.Util.css.getCss("s7container", "height",
					this.id, null, this.container));
			if (!s7sdk.Util.isNumber(this.wid) || this.wid <= 0) {
				this.wid = s7sdk.browser.screensize.w;
				this.hasCustomSize = false
			}
			if (!s7sdk.Util.isNumber(this.hei) || this.hei <= 0) {
				this.hei = s7sdk.browser.screensize.h;
				this.hasCustomSize = false
			}
		}
		this.storedWidth = this.wid;
		this.storedHeight = this.hei;
		this.inFullScreen = false;
		this.fullScreenRequested = false;
		this.init()
	};
	s7sdk.Class.inherits("s7sdk.common.Container", "s7sdk.UIComponent");
	s7sdk.common.Container.prototype.modifiers = {
		stagesize : {
			params : [ "width", "height" ],
			defaults : [ 0, 0 ],
			ranges : [ "0:", "0:" ]
		},
		size : {
			params : [ "width", "height" ],
			defaults : [ 0, 0 ],
			ranges : [ "0:", "0:" ]
		}
	};
	s7sdk.common.Container.prototype.init = function() {
		var a = this.getParent();
		this.createElement();
		if (typeof this.obj != "undefined") {
			this.obj.style.position = "relative";
			a.appendChild(this.obj);
			this.resize(this.wid, this.hei);
			s7sdk.Window.attach(this, "resizeByWindow")
		}
	};
	s7sdk.common.Container.prototype.resizeByWindow = function(a, b) {
		if (!this.hasCustomSize) {
			window.scrollTo(0, 1);
			this.resize(a, b)
		} else {
			if (this.inFullScreen) {
				this.resize(a, b);
				this.moveToTopLeft()
			}
		}
		this.dispatchEvent(new s7sdk.event.ResizeEvent(
				s7sdk.event.ResizeEvent.WINDOW_RESIZE, a, b, false));
		if ((s7sdk.browser.name == "ie") && (s7sdk.browser.version.minor > 5.5)
				&& (s7sdk.browser.version.minor <= 8)) {
			s7sdk.Window.ignoreNextResize = true
		}
	};
	s7sdk.common.Container.prototype.resize = function(a, b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.common.Container.resize - w: %0, h: %1", a, b);
		if (s7sdk.Util.isNumber(a) && s7sdk.Util.isNumber(b)) {
			this.storedWidth = a;
			this.storedHeight = b;
			this.wid = a;
			this.hei = b;
			this.obj.style.width = a + "px";
			this.obj.style.height = b + "px";
			this.dispatchEvent(new s7sdk.event.ResizeEvent(
					s7sdk.event.ResizeEvent.COMPONENT_RESIZE, a, b, false));
			if ((s7sdk.browser.name == "ie")
					&& (s7sdk.browser.version.minor > 5.5)
					&& (s7sdk.browser.version.minor <= 8)) {
				s7sdk.Window.ignoreNextResize = true
			}
		}
		s7sdk.UIComponent.prototype.resize.apply(this, [ a, b ])
	};
	s7sdk.common.Container.prototype.getVendorPrefix = function() {
		var b = /^(Moz|Webkit|Khtml|O|ms)(?=[A-Z])/;
		var a = document.getElementsByTagName("script")[0];
		for ( var c in a.style) {
			if (b.test(c)) {
				return c.match(b)[0]
			}
		}
		if ("WebkitOpacity" in a.style) {
			return "Webkit"
		}
		if ("KhtmlOpacity" in a.style) {
			return "Khtml"
		}
		return ""
	};
	s7sdk.common.Container.prototype.supportsNativeFullScreen = function() {
		var a = false;
		if (typeof document.cancelFullScreen != "undefined") {
			a = true
		} else {
			if (typeof document[this.vendorPrefix.toLowerCase()
					+ "CancelFullScreen"] != "undefined") {
				a = true
			}
		}
		return a
	};
	s7sdk.common.Container.prototype.requestFullScreen = function() {
		if (!this.fullScreenRequested && !this.isFullScreen()) {
			s7sdk.Logger.log(s7sdk.Logger.FINE,
					"s7sdk.common.Container.requestFullScreen");
			var a, d;
			this.fullScreenRequested = true;
			this.storedPosition = new Object();
			if (this.supportsNativeFullScreen()) {
				var b = this;
				function c(h) {
					if (b.isFullScreen()) {
						b.inFullScreen = true;
						b.storedPosition.top = b.obj.style.top;
						b.storedPosition.left = b.obj.style.left;
						b.storedPosition.width = Number(b.obj.style.width
								.replace(/[^-\d\.]/g, ""));
						b.storedPosition.height = Number(b.obj.style.height
								.replace(/[^-\d\.]/g, ""));
						b.obj.style.top = "0px";
						b.obj.style.left = "0px";
						b.obj.style.width = "100%";
						b.obj.style.height = "100%";
						a = b.obj.offsetWidth;
						d = b.obj.offsetHeight;
						b.dispatchEvent(new s7sdk.event.ResizeEvent(
								s7sdk.event.ResizeEvent.COMPONENT_RESIZE, a, d,
								false));
						b.dispatchEvent(new s7sdk.event.ResizeEvent(
								s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE, a,
								d, false))
					} else {
						b.inFullScreen = false;
						b.fullScreenRequested = false;
						b.obj.style.top = b.storedPosition.top;
						b.obj.style.left = b.storedPosition.left;
						b.obj.style.width = b.storedPosition.width + "px";
						b.obj.style.height = b.storedPosition.height + "px";
						b.storedWidth = b.storedPosition.width;
						b.storedHeight = b.storedPosition.height;
						s7sdk.Util.css.setCSSAttributeSelector(b.obj, "mode",
								"normal");
						s7sdk.Event.removeDOMListener(document, b.vendorPrefix
								.toLowerCase()
								+ "fullscreenchange", c, true);
						b.dispatchEvent(new s7sdk.event.ResizeEvent(
								s7sdk.event.ResizeEvent.COMPONENT_RESIZE,
								b.storedWidth, b.storedHeight, false));
						b.dispatchEvent(new s7sdk.event.ResizeEvent(
								s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE,
								b.storedWidth, b.storedHeight, false))
					}
				}
				s7sdk.Event.addDOMListener(document, this.vendorPrefix
						.toLowerCase()
						+ "fullscreenchange", c, true);
				this.vendorPrefix === "" ? this.obj.requestFullScreen()
						: this.obj[this.vendorPrefix.toLowerCase()
								+ "RequestFullScreen"]()
			} else {
				this.inFullScreen = true;
				if ("ontouchstart" in window) {
					s7sdk.Event.addDOMListener(document.body, "touchmove",
							this.preventScroll, false)
				}
				this.storedPosition.scrollBody = document.body.style.overflow;
				this.storedPosition.scrollBodyX = document.body.style.overflowX;
				this.storedPosition.scrollBodyY = document.body.style.overflowY;
				this.storedPosition.position = this.obj.style.position;
				this.storedPosition.left = this.obj.style.left;
				this.storedPosition.top = this.obj.style.top;
				this.storedPosition.width = Number(this.obj.style.width
						.replace(/[^-\d\.]/g, ""));
				this.storedPosition.height = Number(this.obj.style.height
						.replace(/[^-\d\.]/g, ""));
				if (this.container) {
					this.storedPosition.zIndex = this.container.style.zIndex;
					var g = this.getMaxNeighbourZIndex(this.container) + 1;
					this.container.style.zIndex = g
				} else {
					this.storedPosition.zIndex = this.obj.style.zIndex;
					var g = this.getMaxNeighbourZIndex(this.obj) + 1;
					this.obj.style.zIndex = g
				}
				var f = this.obj.getBoundingClientRect();
				var e = s7sdk.browser.device;
				a = s7sdk.browser.detectScreen().w;
				d = s7sdk.browser.detectScreen().h;
				document.body.style.overflow = "hidden";
				this.moveToTopLeft();
				if ((e.name == "ipad" || e.name == "iphone")
						&& s7sdk.browser.detectScreen().w == 981) {
					a -= 1
				}
				this.resize(a, d);
				this
						.dispatchEvent(new s7sdk.event.ResizeEvent(
								s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE, a,
								d, false))
			}
		}
	};
	s7sdk.common.Container.prototype.preventScroll = function(a) {
		var a = a || window.event;
		s7sdk.Event.preventDefault(a)
	};
	s7sdk.common.Container.prototype.isMobile = function() {
		var a = navigator.userAgent.toLowerCase();
		return (a.match(/(iphone|ipod|ipad|android)/))
	};
	s7sdk.common.Container.prototype.moveToTopLeft = function() {
		s7sdk.Util.css.setCSSAttributeSelector(this.obj, "mode", "fullscreen");
		var b = parseInt(s7sdk.Util.getStyle(this.obj, "left"));
		var e = parseInt(s7sdk.Util.getStyle(this.obj, "top"));
		b = s7sdk.Util.isNumber(b) ? b : -parseInt(s7sdk.Util.getStyle(
				this.obj, "right"));
		e = s7sdk.Util.isNumber(e) ? e : -parseInt(s7sdk.Util.getStyle(
				this.obj, "bottom"));
		b = s7sdk.Util.isNumber(b) ? b : 0;
		e = s7sdk.Util.isNumber(e) ? e : 0;
		var c = this.obj.getBoundingClientRect();
		var a = c.left - b;
		var d = c.top - e;
		this.obj.style.left = -a + "px";
		this.obj.style.top = -d + "px"
	};
	s7sdk.common.Container.prototype.getMaxNeighbourZIndex = function(e) {
		var d = -1;
		for ( var b = 0; b < e.parentNode.children.length; b++) {
			var a = e.parentNode.children[b];
			var c = this.getZIndex(a);
			if (this.isPositioned(a) && (c > 0)) {
				c = this.getZIndex(a)
			} else {
				if (a.children.length > 0) {
					c = this.getMaxNeighbourZIndex(a.children[0])
				} else {
					c = 0
				}
			}
			if (c > d) {
				d = c
			}
		}
		return d
	};
	s7sdk.common.Container.prototype.getZIndex = function(b) {
		var a;
		if (window.getComputedStyle) {
			a = document.defaultView.getComputedStyle(b, null)
					.getPropertyValue("z-index")
		} else {
			if (b.currentStyle) {
				a = b.currentStyle.zIndex
			}
		}
		if (a == "auto") {
			a = 0
		}
		return parseInt(a)
	};
	s7sdk.common.Container.prototype.isPositioned = function(b) {
		var a;
		if (window.getComputedStyle) {
			a = document.defaultView.getComputedStyle(b, null)
					.getPropertyValue("position")
		} else {
			if (b.currentStyle) {
				a = b.currentStyle.position
			}
		}
		return (a == "absolute") || (a == "relative") || (a == "fixed")
	};
	s7sdk.common.Container.prototype.cancelFullScreen = function() {
		this.fullScreenRequested = false;
		if (this.isFullScreen()) {
			s7sdk.Logger.log(s7sdk.Logger.FINE,
					"s7sdk.common.Container.cancelFullScreen");
			this.inFullScreen = false;
			if (this.supportsNativeFullScreen()) {
				this.vendorPrefix === "" ? document.cancelFullScreen()
						: document[this.vendorPrefix.toLowerCase()
								+ "CancelFullScreen"]()
			} else {
				if ("ontouchstart" in window) {
					s7sdk.Event.removeDOMListener(document.body, "touchmove",
							this.preventScroll, false)
				}
				document.body.style.overflow = this.storedPosition.scrollBody;
				document.body.style.overflowX = this.storedPosition.scrollBodyX;
				document.body.style.overflowY = this.storedPosition.scrollBodyY;
				s7sdk.Util.css.setCSSAttributeSelector(this.obj, "mode",
						"normal");
				this.obj.style.position = this.storedPosition.position;
				this.obj.style.left = this.storedPosition.left;
				this.obj.style.top = this.storedPosition.top;
				if (this.container) {
					this.container.style.zIndex = this.storedPosition.zIndex
				} else {
					this.obj.style.zIndex = this.storedPosition.zIndex
				}
				this.resize(this.storedPosition.width,
						this.storedPosition.height);
				this.dispatchEvent(new s7sdk.event.ResizeEvent(
						s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE,
						this.storedPosition.width, this.storedPosition.height,
						false))
			}
		}
	};
	s7sdk.common.Container.prototype.isFullScreen = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.common.Container.isFullScreen");
		var a;
		switch (this.vendorPrefix.toLowerCase()) {
		case "":
			a = document.fullScreen;
			break;
		case "webkit":
			a = document.webkitIsFullScreen;
			break;
		default:
			a = document[this.vendorPrefix.toLowerCase() + "FullScreen"]
		}
		return (typeof a != "undefined" ? a : this.inFullScreen)
	};
	s7sdk.common.Container.prototype.addEventListener = function(c, b, a) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.common.Container.addEventListener - type: %0, handler: %1, useCapture: %2",
						c,
						b.toString().substring(0, b.toString().indexOf("(")), a);
		s7sdk.Base.prototype.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.Container = s7sdk.common.Container;
	(function addDefaultCSS() {
		var a = s7sdk.Util.css.createCssRuleText(".s7container", {
			overflow : "hidden"
		})
				+ s7sdk.Util.css.createCssRuleText(
						".s7container[mode='fullscreen']", {
							border : "0px !important",
							margin : "0px !important",
							padding : "0px !important"
						});
		s7sdk.Util.css.addDefaultCSS(a, "Container")
	})()
};