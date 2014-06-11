/*!************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
s7sdk.pkg("s7sdk.event");
s7sdk.Util.require("s7sdk.utils.Version");
if (!s7sdk.event.AssetEvent) {
	s7sdk.event.AssetEvent = function(c, b, d, a) {
		this.type = c;
		this.asset = b;
		this.frame = d;
		this.bubbles = a
	};
	s7sdk.event.AssetEvent.SWATCH_SELECTED_EVENT = "swatchSelectedEvent";
	s7sdk.event.AssetEvent.ITEM_SELECTED_EVENT = "itemSelectedEvent";
	s7sdk.event.AssetEvent.NOTF_SET_PARSED = "notfSetParsed";
	s7sdk.event.AssetEvent.ASSET_CHANGED = "assetChanged";
	s7sdk.AssetEvent = s7sdk.event.AssetEvent
}
if (!s7sdk.event.SwatchEvent) {
	s7sdk.event.SwatchEvent = function(b, c, a) {
		this.type = b;
		this.page = c;
		this.bubbles = a
	};
	s7sdk.event.SwatchEvent.SWATCH_PAGE_CHANGE = "swatchPageChanged";
	s7sdk.SwatchEvent = s7sdk.event.SwatchEvent
}
if (!s7sdk.event.RolloverKeyEvent) {
	s7sdk.event.RolloverKeyEvent = function(e, d, c, b, a, f) {
		this.type = e;
		this.rolloverKey = d;
		this.boundingBox = c;
		this.href = b;
		this.bubbles = a;
		this.frame = f
	};
	s7sdk.event.RolloverKeyEvent.prototype.rolloverKey = null;
	s7sdk.event.RolloverKeyEvent.prototype.boundingBox = null;
	s7sdk.event.RolloverKeyEvent.prototype.href = null;
	s7sdk.event.RolloverKeyEvent.prototype.frame = null;
	s7sdk.event.RolloverKeyEvent.ROLLOVER_ACTIVATED = "rolloverActivated";
	s7sdk.event.RolloverKeyEvent.ROLLOVER_DEACTIVATED = "rolloverDeactivated";
	s7sdk.event.RolloverKeyEvent.VIEWER_ACTIVATED = "viewerActivated";
	s7sdk.event.RolloverKeyEvent.TARGET_INDEX = "targetIndex";
	s7sdk.RolloverKeyEvent = s7sdk.event.RolloverKeyEvent
}
if (!s7sdk.event.ZoomRgnEvent) {
	s7sdk.event.ZoomRgnEvent = function(d, a, c, b) {
		if (c == undefined || c == null) {
			c = false
		}
		if (b == undefined || b == null) {
			b = false
		}
		this.type = d;
		this.zoomRgn = a;
		this.bubbles = c;
		this.cancelable = b
	};
	s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_RGN = "notfZoomRgn";
	s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_NRGN = "notfZoomNRgn";
	s7sdk.ZoomRgnEvent = s7sdk.event.ZoomRgnEvent
}
if (!s7sdk.event.ZoomPanEvent) {
	s7sdk.event.ZoomPanEvent = function(d, c, b, a) {
		this.type = d;
		this.dx = c;
		this.dy = b;
		this.bubbles = a ? a : true
	};
	s7sdk.event.ZoomPanEvent.ACT_ZOOM_PAN = "actZoomPan";
	s7sdk.event.ZoomPanEvent.ACT_ZOOM_NPAN = "actZoomNPan";
	s7sdk.event.ZoomPanEvent.NOTF_ZOOM_PAN = "notfZoomPan";
	s7sdk.event.ZoomPanEvent.NOTF_ZOOM_NPAN = "notfZoomNPan";
	s7sdk.ZoomPanEvent = s7sdk.event.ZoomPanEvent
}
if (!s7sdk.event.ZoomTargetEvent) {
	s7sdk.event.ZoomTargetEvent = function ZoomTargetEvent(c, b, e, d, a) {
		this.type = c;
		this.idx = b;
		this.frame = e;
		this.image = d;
		this.zoomRgn = a;
		this.bubbles = true
	};
	s7sdk.event.ZoomTargetEvent.ZOOM_TARGET = "zoomTarget";
	s7sdk.ZoomTargetEvent = s7sdk.event.ZoomTargetEvent
}
if (!s7sdk.event.CapabilityStateEvent) {
	s7sdk.event.CapabilityStateEvent = function CapabilityStateEvent(b, c, a) {
		this.type = b;
		this.state = c;
		this.bubbles = a
	};
	s7sdk.event.CapabilityStateEvent.NOTF_PAGEVIEW_CAPABILITY_STATE = "notfPageViewCapabilityState";
	s7sdk.event.CapabilityStateEvent.NOTF_SPIN_CAPABILITY_STATE = "notfSpinCapabilityState";
	s7sdk.event.CapabilityStateEvent.NOTF_ZOOM_CAPABILITY_STATE = "notfZoomCapabilityState";
	s7sdk.event.CapabilityStateEvent.NOTF_VIDEO_CAPABILITY_STATE = "notfVideoCapabilityState";
	s7sdk.CapabilityStateEvent = s7sdk.event.CapabilityStateEvent
}
if (!s7sdk.event.FrameEvent) {
	s7sdk.event.FrameEvent = function FrameEvent(b, c, d, a) {
		this.type = b;
		this.image = c;
		this.frameIndex = d;
		this.bubbles = a ? a : true
	};
	s7sdk.event.FrameEvent.FRAME_EVENT = "frameEvent";
	s7sdk.event.FrameEvent.NOTF_FRAME_TRANSITION_START = "notfFrameTransitionStart";
	s7sdk.event.FrameEvent.NOTF_FRAME_TRANSITION_END = "notfFrameTransitionEnd";
	s7sdk.FrameEvent = s7sdk.event.FrameEvent
}
if (!s7sdk.event.FlyoutEvent) {
	s7sdk.event.FlyoutEvent = function FlyoutEvent(b, a) {
		this.type = b;
		this.bubbles = a ? a : true
	};
	s7sdk.event.FrameEvent.FLAYOUT_EVENT = "flyoutEvent";
	s7sdk.event.FlyoutEvent.NOTF_FLYOUT_SHOW_START = "notfFlyoutShowStart";
	s7sdk.event.FlyoutEvent.NOTF_FLYOUT_HIDE_END = "notfFlyoutHideEnd";
	s7sdk.FlyoutEvent = s7sdk.event.FlyoutEvent
}
if (!s7sdk.Gesture) {
	s7sdk.Gesture = function() {
		this.view = null;
		this.type;
		this.currentX;
		this.currentY;
		this.initialTimeStamp = 0;
		this.currentTimeStamp = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.doubleClickTestTimer = null;
		this.inPinch = false;
		var a = s7sdk.browser.device;
		this.multiTouchSafe = !(a.name == "android" && parseFloat(a.version) < 3)
	};
	s7sdk.Gesture.prototype.setEventData = function(a, f, c) {
		var e = c - this.currentTimeStamp;
		this.currentTimeStamp = c;
		var d = a - this.currentX;
		var b = f - this.currentY;
		this.currentX = a;
		this.currentY = f;
		this.speedX = Math.abs(d / e);
		this.speedY = Math.abs(b / e)
	}
}
if (!s7sdk.VisibilityManager) {
	s7sdk.VisibilityManager = function() {
		s7sdk.Logger.log(s7sdk.Logger.CONFIG,
				"s7sdk.VisibilityManager constructor");
		arguments.callee.superclass.call(this, s7sdk.Util.createUniqueId(),
				null, "span");
		this.objs = [];
		this.refobj = null;
		this.hidden = false;
		this.enabled = true;
		this.createElement();
		this.getParent().appendChild(this.obj);
		this.obj.style.display = "none"
	};
	s7sdk.Class.inherits("s7sdk.VisibilityManager", "s7sdk.Base");
	s7sdk.VisibilityManager.prototype.attach = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.VisibilityManager.attach - obj: %0", a);
		if (this.objs.indexOf(a) == -1) {
			this.objs.push(a)
		}
	};
	s7sdk.VisibilityManager.prototype.detach = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.VisibilityManager.detach - obj: %0", a);
		if (this.objs.indexOf(a) != -1) {
			this.objs.splice(this.objs.indexOf(a), 1)
		}
	};
	s7sdk.VisibilityManager.prototype.detachAll = function() {
		s7sdk.Logger
				.log(s7sdk.Logger.FINE, "s7sdk.VisibilityManager.detachAll");
		this.objs.splice(0, this.objs.length)
	};
	s7sdk.VisibilityManager.prototype.tap = function(b) {
		var c = null;
		if (b.target) {
			c = (b.target.nodeType == 3) ? b.target.parentNode : b.target
		} else {
			c = b.srcElement
		}
		if (c && c.visibilityManager.enabled) {
			for ( var a = 0; a < c.visibilityManager.objs.length; a++) {
				if (c.visibilityManager.hidden && c.visibilityManager.objs[a]
						&& c.visibilityManager.objs[a].show) {
					c.visibilityManager.objs[a].show()
				} else {
					if (c.visibilityManager.objs[a]
							&& c.visibilityManager.objs[a].hide) {
						c.visibilityManager.objs[a].hide()
					}
				}
			}
			c.visibilityManager.hidden = !c.visibilityManager.hidden
		}
	};
	s7sdk.VisibilityManager.prototype.reference = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.VisibilityManager.reference - obj: %0", a);
		this.refobj = a;
		if (!this.refobj.obj.visibilityManager) {
			this.refobj.obj.visibilityManager = this;
			this.refobj.addEventListener(s7sdk.Event.CLICK, this.tap, true)
		}
	}
}
if (!s7sdk.event.PageMouseEvent) {
	s7sdk.event.PageMouseEvent = {
		lastclick : null,
		dblclick : false,
		downPos : null,
		upPos : null,
		getPos : function(a) {
			if (a.pageX || a.pageY) {
				return {
					x : a.pageX,
					y : a.pageY
				}
			} else {
				return {
					x : a.clientX + document.body.scrollLeft
							- document.body.clientLeft,
					y : a.clientY + document.body.scrollTop
							- document.body.clientTop
				}
			}
		},
		isSwipe : function() {
			return ((s7sdk.event.PageMouseEvent.downPos.x != s7sdk.event.PageMouseEvent.upPos.x) || (s7sdk.event.PageMouseEvent.downPos.y != s7sdk.event.PageMouseEvent.upPos.y))
		},
		mousedown : function(a) {
			s7sdk.event.PageMouseEvent.downPos = s7sdk.event.PageMouseEvent
					.getPos(a)
		},
		mouseup : function(b) {
			s7sdk.event.PageMouseEvent.upPos = s7sdk.event.PageMouseEvent
					.getPos(b);
			if (s7sdk.event.PageMouseEvent.isSwipe()) {
				s7sdk.event.PageMouseEvent.issue(s7sdk.Event.SWIPE)
			} else {
				if (s7sdk.event.PageMouseEvent.lastclick == null) {
					s7sdk.event.PageMouseEvent.lastclick = new Date()
				} else {
					var a = new Date();
					s7sdk.event.PageMouseEvent.dblclick = (a.getTime() - s7sdk.event.PageMouseEvent.lastclick
							.getTime()) < 300;
					s7sdk.event.PageMouseEvent.lastclick = a
				}
				if (!s7sdk.event.PageMouseEvent.dblclick) {
					setTimeout(s7sdk.event.PageMouseEvent.delayClick, 300)
				}
			}
		},
		touchstart : function(a) {
			s7sdk.event.PageMouseEvent.mousedown(a)
		},
		touchend : function(a) {
			s7sdk.event.PageMouseEvent.mouseup(a)
		},
		delayClick : function() {
			if (s7sdk.event.PageMouseEvent.dblclick) {
				s7sdk.event.PageMouseEvent.issue(s7sdk.Event.DBLCLICK)
			} else {
				s7sdk.event.PageMouseEvent.issue(s7sdk.Event.CLICK)
			}
		},
		issue : function(b) {
			var a = document.createEvent("Events");
			a.initEvent(b, true, false);
			window.dispatchEvent(a)
		}
	};
	if ("ontouchstart" in window) {
		s7sdk.Event.addDOMListener(window, "touchstart",
				s7sdk.event.PageMouseEvent.touchstart, true);
		s7sdk.Event.addDOMListener(window, "touchend",
				s7sdk.event.PageMouseEvent.touchend, true)
	} else {
		s7sdk.Event.addDOMListener(window, "mousedown",
				s7sdk.event.PageMouseEvent.mousedown, true);
		s7sdk.Event.addDOMListener(window, "mouseup",
				s7sdk.event.PageMouseEvent.mouseup, true)
	}
	s7sdk.PageMouseEvent = s7sdk.event.PageMouseEvent
}
if (!s7sdk.event.ResizeEvent) {
	s7sdk.event.ResizeEvent = function(d, b, c, a) {
		this.type = d;
		this.w = b;
		this.h = c;
		this.bubbles = a ? a : true
	};
	s7sdk.event.ResizeEvent.WINDOW_RESIZE = "windowResize";
	s7sdk.event.ResizeEvent.COMPONENT_RESIZE = "componentResize";
	s7sdk.event.ResizeEvent.FULLSCREEN_RESIZE = "fullScreenResize";
	s7sdk.ResizeEvent = s7sdk.event.ResizeEvent
}
if (!s7sdk.event.UserEvent) {
	s7sdk.event.UserEvent = function UserEvent(b, c, a) {
		this.type = s7sdk.event.UserEvent.NOTF_USER_EVENT;
		this.trackEvent = b;
		this.data = c;
		this.bubbles = a ? a : true;
		this.useCapture = false
	};
	s7sdk.event.UserEvent.prototype.getEncodedData = function() {
		var a = [];
		if (s7sdk.Util.isArray(this.data)) {
			for ( var b in this.data) {
				if (typeof this.data[b] != "function") {
					a.push(encodeURIComponent(this.data[b]))
				}
			}
		} else {
			a.push(encodeURIComponent(this.data))
		}
		return a
	};
	s7sdk.event.UserEvent.prototype.toString = function() {
		return this.trackEvent
				+ (this.data == null ? "" : "," + this.getEncodedData())
	};
	s7sdk.event.UserEvent.NOTF_USER_EVENT = "notfUserEvent";
	s7sdk.event.UserEvent.SWAP = "SWAP";
	s7sdk.event.UserEvent.SWATCH = "SWATCH";
	s7sdk.event.UserEvent.PAGE = "PAGE";
	s7sdk.event.UserEvent.PLAY = "PLAY";
	s7sdk.event.UserEvent.PAUSE = "PAUSE";
	s7sdk.event.UserEvent.RECORD = "RECORD";
	s7sdk.event.UserEvent.STOP = "STOP";
	s7sdk.event.UserEvent.MILESTONE = "MILESTONE";
	s7sdk.event.UserEvent.HREF = "HREF";
	s7sdk.event.UserEvent.ITEM = "ITEM";
	s7sdk.event.UserEvent.TARG = "TARG";
	s7sdk.event.UserEvent.LOAD = "LOAD";
	s7sdk.event.UserEvent.ZOOM = "ZOOM";
	s7sdk.event.UserEvent.SPIN = "SPIN";
	s7sdk.event.UserEvent.PAN = "PAN";
	s7sdk.UserEvent = s7sdk.event.UserEvent
}
if (!s7sdk.event.ScrollEvent) {
	s7sdk.event.ScrollEvent = function(c, a, b) {
		this.type = c;
		this.position = a;
		this.bubbles = b
	};
	s7sdk.event.ScrollEvent.SCROLL_POSITION_EVENT = "scrollPositionEvent";
	s7sdk.ScrollEvent = s7sdk.event.ScrollEvent
}
if (!s7sdk.event.SliderEvent) {
	s7sdk.event.SliderEvent = function SliderEvent(c, a, b) {
		this.type = c;
		this.position = a;
		this.bubbles = b ? b : true;
		this.useCapture = false
	};
	s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN = "notfSliderDown";
	s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE = "notfSliderMove";
	s7sdk.event.SliderEvent.NOTF_SLIDER_UP = "notfSliderUp";
	s7sdk.SliderEvent = s7sdk.event.SliderEvent
}
if (!s7sdk.event.VideoEvent) {
	s7sdk.event.VideoEvent = function VideoEvent(b, c, a) {
		this.type = b;
		this.data = c;
		this.bubbles = a ? a : true;
		this.useCapture = false
	};
	s7sdk.event.VideoEvent.NOTF_CURRENT_TIME = "notfCurrentTime";
	s7sdk.event.VideoEvent.NOTF_DURATION = "notfDuration";
	s7sdk.event.VideoEvent.NOTF_LOAD_PROGRESS = "notfLoadProgress";
	s7sdk.event.VideoEvent.NOTF_VOLUME = "notfVolume";
	s7sdk.event.VideoEvent.NOTF_SEEK = "notfSeek";
	s7sdk.event.VideoEvent.NOTF_VIDEO_END = "notfVideoEnd";
	s7sdk.VideoEvent = s7sdk.event.VideoEvent
};