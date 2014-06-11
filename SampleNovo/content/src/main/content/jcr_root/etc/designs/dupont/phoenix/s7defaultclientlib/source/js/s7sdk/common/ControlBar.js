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
s7sdk.pkg("s7sdk.common");
s7sdk.Util.require("s7sdk.common.Enumeration");
if (!s7sdk.common.ControlBar) {
	s7sdk.common.ControlBar = function ControlBar(a, c, b) {

		s7sdk.Logger
				.log(
						s7sdk.Logger.CONFIG,
						"s7sdk.common.ControlBar constructor - containerId: %0, settings: %1 , compId: %2",
						a, c, b);
		b = (typeof b == "string" && b.length) ? b : "ControlBar_"
				+ s7sdk.Util.createUniqueId();
		arguments.callee.superclass.apply(this, [ b, a, "div", "s7controlbar",
				c ]);
		this.createElement();
		this.container = s7sdk.Util.byId(a);
		this.container.appendChild(this.obj);
		if (this.transition.transition == "fade") {
			if (s7sdk.browser.name === "ie" && s7sdk.browser.version.major < 9) {
				this.transition.transition = "none"
			}
		} else {
			this.transition.transition = "none"
		}
		var d = this;
		this.lastMouse = {
			x : -1000000,
			y : -1000000
		};
		if (this.transition.delaytohide != -1) {
			this.trans = {
				transitionTime : (typeof (this.transition.duration) == "undefined" ? 5000
						: this.transition.duration * 1000),
				delayToHide : (typeof (this.transition.delaytohide) == "undefined" ? 5000
						: this.transition.delaytohide * 1000)
			};
			this.animate = new s7sdk.common.Animation(this,
					this.trans.transitionTime, this.trans.delayToHide,
					this.transition.transition);
			this.fnShow = function(f) {
				if (d.isHiding) {
					return
				}
				d.showEv(f)
			};
			this.addEventListener("mousemove", this.fnShow);
			this.addEventListener("mousedown", this.fnShow);
			this.addEventListener("touchmove", this.fnShow, true);
			this.addEventListener("touchstart", this.fnShow, true);
			this.winMouseMoveHandler = function(f) {
				f = f || window.event;
				d.lastMouse = {
					x : s7sdk.Util.getEventPos(f).x,
					y : s7sdk.Util.getEventPos(f).y
				}
			};
			this.winMouseOutHandler = function(f) {
				f = f || window.event;
				d.lastMouse = {
					x : -1000000,
					y : -1000000
				}
			};
			var e = s7sdk.browser.name == "ie" ? document : window;
			s7sdk.Event.addDOMListener(e, "mouseout", this.winMouseOutHandler,
					true);
			s7sdk.Event.addDOMListener(e, "mousemove",
					this.winMouseMoveHandler, true)
		}
		this.views = [];
		this.viewsExternal = [];
		this.manualOn = this.manual = false;
		this.allowHide = true
	};
	s7sdk.Class.inherits("s7sdk.common.ControlBar", "s7sdk.UIComponent");
	s7sdk.common.ControlBar.prototype.modifiers = {
		transition : {
			params : [ "transition", "delaytohide", "duration" ],
			defaults : [ "fade", 2, 0.5 ],
			ranges : [ [ "none", "fade" ], "-1:", "0:" ]
		}
	};
	s7sdk.common.ControlBar.prototype.viewAttached = function(c, a) {
		for ( var b = 0; b < c.length; b++) {
			if (c[b] == a) {
				return b
			}
		}
		return -1
	};
	s7sdk.common.ControlBar.prototype.animationStep = function(c, a) {
		if (this.transition.transition == "fade") {
			var e = a ? c : 1 - c;
			s7sdk.Util.setOpacity(this.obj, e);
			for ( var b = 0; b < this.viewsExternal.length; b++) {
				var d = this.viewsExternal[b];
				s7sdk.Util.setOpacity(d, e)
			}
		}
	};
	s7sdk.common.ControlBar.prototype.animationStart = function() {
	};
	s7sdk.common.ControlBar.prototype.animationStop = function(c) {
		if (this.manualOn) {
			this.animate.transitionTime = this.trans.transitionTime;
			if (c) {
				this.manual = false
			}
			this.manualOn = false
		}
		if (this.isHiding) {
			this.d_style = s7sdk.Util.getStyle(this.obj, "display");
			this.obj.style.display = "none";
			this.isHiding = false
		}
		if (this.transition.transition == "fade") {
			var d = c ? 1 : 0;
			s7sdk.Util.setOpacity(this.obj, d);
			for ( var a = 0; a < this.viewsExternal.length; a++) {
				var b = this.viewsExternal[a];
				s7sdk.Util.setOpacity(b, d)
			}
		} else {
			if (s7sdk.browser.name === "ie" && s7sdk.browser.version.major < 8) {
				this.obj.style.filter = "alpha(opacity=0)";
				for ( var a = 0; a < this.viewsExternal.length; a++) {
					var b = this.viewsExternal[a];
					b.style.filter = "alpha(opacity=0)"
				}
			} else {
				this.obj.style.visibility = "hidden";
				for ( var a = 0; a < this.viewsExternal.length; a++) {
					var b = this.viewsExternal[a];
					b.style.visibility = "hidden"
				}
			}
		}
	};
	s7sdk.common.ControlBar.prototype.showEv = function(b) {
		if (!this.manual || this.manualOn) {
			if (this.transition.transition == "none") {
				if (s7sdk.browser.name === "ie"
						&& s7sdk.browser.version.major < 8) {
					this.obj.style.filter = "";
					for ( var a = 0; a < this.viewsExternal.length; a++) {
						var c = this.viewsExternal[a];
						c.style.filter = ""
					}
				} else {
					this.obj.style.visibility = "inherit";
					for ( var a = 0; a < this.viewsExternal.length; a++) {
						var c = this.viewsExternal[a];
						c.style.visibility = "inherit"
					}
				}
			}
			this.animate.startTransition()
		}
	};
	s7sdk.common.ControlBar.prototype.checkMouse = function() {
		if ("ontouchstart" in window) {
			return false
		}
		var c = s7sdk.Util.getObjPos(this.obj);
		var b = this.lastMouse.x - c.x;
		var a = this.lastMouse.y - c.y;
		return (b > 0 && b < this.obj.offsetWidth && a > 0 && a < this.obj.offsetHeight)
	};
	s7sdk.common.ControlBar.prototype.addEventListener = function(c, b, a) {
		this.superproto.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.common.ControlBar.prototype.attachView = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.common.ControlBar.attachView - view: %0", b);
		if (this.transition.delaytohide != -1) {
			var a = b instanceof s7sdk.Base ? b.obj : b;
			var c = this.viewAttached(this.views, a);
			if (c == -1) {
				this.views.push(a);
				s7sdk.Event.addDOMListener(a, "mousemove", this.fnShow);
				s7sdk.Event.addDOMListener(a, "touchmove", this.fnShow, true);
				s7sdk.Event.addDOMListener(a, "touchstart", this.fnShow, true)
			}
		}
	};
	s7sdk.common.ControlBar.prototype.detachView = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.common.ControlBar.detachView - view: %0", b);
		if (this.transition.delaytohide != -1) {
			var a = b instanceof s7sdk.Base ? b.obj : b;
			var c = this.viewAttached(this.views, a);
			if (c != -1) {
				this.views.splice(c, 1);
				s7sdk.Event.removeDOMListener(a, "mousemove", this.fnShow);
				s7sdk.Event
						.removeDOMListener(a, "touchmove", this.fnShow, true);
				s7sdk.Event.removeDOMListener(a, "touchstart", this.fnShow,
						true)
			}
		}
	};
	s7sdk.common.ControlBar.prototype.attach = function(b) {
		var a = b instanceof s7sdk.Base ? b.obj : b;
		var c = this.viewAttached(this.viewsExternal, a);
		if (c == -1) {
			this.viewsExternal.push(a)
		}
	};
	s7sdk.common.ControlBar.prototype.detach = function(b) {
		var a = b instanceof s7sdk.Base ? b.obj : b;
		var c = this.viewAttached(this.viewsExternal, a);
		if (c != -1) {
			this.viewsExternal.splice(c, 1)
		}
	};
	s7sdk.common.ControlBar.prototype.detachAll = function() {
		s7sdk.Logger
				.log(s7sdk.Logger.FINE, "s7sdk.common.ControlBar.detachAll");
		if (this.transition.delaytohide != -1) {
			while (this.views.length != 0) {
				var a = this.views.pop();
				s7sdk.Event.removeDOMListener(a, "mousemove", this.fnShow);
				s7sdk.Event
						.removeDOMListener(a, "touchmove", this.fnShow, true);
				s7sdk.Event.removeDOMListener(a, "touchstart", this.fnShow,
						true)
			}
		}
	};
	s7sdk.common.ControlBar.prototype.show = function() {
		this.isHiding = false;
		if (this.d_style) {
			this.obj.style.display = this.d_style
		}
		if (this.transition.transition == "fade") {
			this.manualOn = true
		} else {
			this.manualOn = false;
			this.manual = false
		}
		if (this.animate) {
			switch (this.animate.state) {
			case 0:
				this.animate.transitionTime = 300;
				this.showEv();
				break;
			case 1:
			case 3:
				this.animate.transitionTime = 300;
				this.animate.calcShift(this.animate.state == 3);
				this.animate.state = 1;
				this.animate.reverse = true;
				break
			}
		} else {
			s7sdk.Util.fade(this.obj, false, 0.3, "block")
		}
	};
	s7sdk.common.ControlBar.prototype.hide = function() {
		this.manualOn = false;
		this.manual = true;
		this.isHiding = true;
		if (this.animate) {
			switch (this.animate.state) {
			case 2:
				this.animate.transitionTime = 300;
				this.animate.startTransition();
				this.animate.startTime = (new Date()).getTime()
						- this.animate.delayToHide;
				if (!this.allowHide) {
					this.animate.reverse = false;
					this.animate.state = 5
				}
				break;
			case 3:
			case 1:
				this.animate.transitionTime = 300;
				this.animate.calcShift(this.animate.state == 3);
				if (this.animate.state == 1) {
					this.animate.state = 3;
					this.animate.reverse = false
				}
				break;
			case 4:
				this.animate.transitionTime = 300;
				this.animate.state = 5;
				this.animate.startTransition();
				break
			}
		} else {
			s7sdk.Util.fade(this.obj, true, 0.3, "block");
			this.isHiding = false
		}
	};
	s7sdk.common.ControlBar.prototype.allowAutoHide = function(a) {
		this.allowHide = a;
		if (this.animate) {
			this.animate.allowHide = a;
			switch (this.animate.state) {
			case 0:
				this.animate.transitionTime = this.trans.transitionTime;
				this.showEv();
				break;
			case 4:
				this.manualOn = true;
				this.animate.state = 2;
				this.animate.transitionTime = this.trans.transitionTime;
				this.animate.startTransition();
				this.animate.startTime = (new Date()).getTime()
						- this.animate.delayToHide;
				break;
			case 2:
				break;
			case 1:
				break;
			case 3:
				this.animate.calcShift(true);
				this.animate.state = 1;
				this.animate.reverse = true;
				break
			}
		}
	};
	s7sdk.ControlBar = s7sdk.common.ControlBar;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = {
			"background-color" : "#a6a6a6",
			position : "relative",
			width : "420px",
			height : "30px",
			"-webkit-touch-callout" : "none",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)"
		};
		if (("android" == s7sdk.browser.device.name)
				&& (4 == s7sdk.browser.device.version)) {
			b["-webkit-perspective"] = "1000"
		}
		var a = c(".s7controlbar", b);
		s7sdk.Util.css.addDefaultCSS(a, "ControlBar")
	})()
}
if (!s7sdk.common.Animation) {
	s7sdk.common.Animation = function(e, b, a, c, f) {
		this.allowHide = true;
		this.transitionEasing = typeof (f) == "undefined" ? s7sdk.Enum.TRANSITION_EASING.AUTO
				: f;
		this.type = c;
		this.startTime = (new Date()).getTime();
		this.shiftTime = 0;
		this.maxStep = 60;
		this.transitionTime = b;
		this.delayToHide = a;
		this.state = 2;
		this.viewParent = e;
		var d = this;
		this.tmr = setInterval(function() {
			d.onEnterFrame()
		}, 25)
	};
	s7sdk.common.Animation.prototype.onEnterFrame = function() {
		if (this.state == 0 || this.state == 4) {
			return
		}
		var c = (new Date()).getTime();
		if (this.state == 2 || this.state == 5) {
			if (c - this.startTime > this.delayToHide) {
				if (this.allowHide || this.state == 5) {
					var b = false;
					if (this.viewParent != null
							&& typeof (this.viewParent.checkMouse) != null) {
						b = this.viewParent.checkMouse()
					}
					if (!b) {
						if (this.type == "none") {
							this.state = 0;
							this.stopTransition(false)
						} else {
							this.prevStep = 0;
							this.shiftTime = 0;
							this.startTime = c;
							this.state = 3;
							this.reverse = false
						}
					}
				} else {
					this.state = 4
				}
			}
			return
		}
		var a = this.calcStep(c);
		if (a == 0) {
			return
		}
		if (a >= 1) {
			if (this.state == 1) {
				this.state = 2;
				this.startTime = c;
				this.stopTransition(true)
			} else {
				if (this.state == 3) {
					this.state = 0;
					this.stopTransition(false)
				}
			}
			return
		}
		if (this.viewParent != null
				&& typeof (this.viewParent.viewTransitionStep) != null) {
			this.viewParent.animationStep(a, this.reverse)
		}
	};
	s7sdk.common.Animation.prototype.calcStep = function(b) {
		var a = (this.transitionTime != 0) ? (b + this.shiftTime - this.startTime)
				/ this.transitionTime
				: 1;
		if (a > this.prevStep + this.maxStep) {
			a = this.prevStep + this.maxStep
		}
		this.prevStep = a;
		if (a == 0) {
			return a
		}
		if (a >= 1) {
			return a
		}
		if (this.transitionEasing == s7sdk.Enum.TRANSITION_EASING.AUTO) {
		} else {
			if (this.transitionEasing == s7sdk.Enum.TRANSITION_EASING.QUADRATIC) {
				a = (a * (a - 2)) * -1
			} else {
				if (this.transitionEasing == s7sdk.Enum.TRANSITION_EASING.CUBIC) {
					a = (a -= 1) * a * a + 1
				} else {
					if (this.transitionEasing == s7sdk.Enum.TRANSITION_EASING.QUARTIC) {
						a = ((a -= 1) * a * a * a - 1) * -1
					} else {
						if (this.transitionEasing == s7sdk.Enum.TRANSITION_EASING.QUINTIC) {
							a = (a -= 1) * a * a * a * a + 1
						}
					}
				}
			}
		}
		return a
	};
	s7sdk.common.Animation.prototype.startTransition = function() {
		this.reverse = true;
		switch (this.state) {
		case 0:
			this.shiftTime = 0;
			this.prevStep = 0;
			this.startTime = (new Date()).getTime();
			if (this.type == "none") {
				this.state = 2
			} else {
				this.state = 1
			}
			if (this.viewParent != null
					&& this.viewParent.animationStart != null) {
				this.viewParent.animationStart()
			}
			break;
		case 1:
			break;
		case 2:
			this.startTime = (new Date()).getTime();
			break;
		case 3:
			this.state = 1;
			this.calcShift(true);
			if (this.viewParent != null
					&& this.viewParent.animationStart != null) {
				this.viewParent.animationStart()
			}
			break
		}
	};
	s7sdk.common.Animation.prototype.calcShift = function(c) {
		this.startTime = (new Date()).getTime();
		if (this.prevStep != 0) {
			var b = c ? 1 - this.prevStep : this.prevStep;
			var d = this.startTime;
			var a = this.calcStep(d);
			while (a < b) {
				d++;
				a = this.calcStep(d)
			}
			this.shiftTime = d - this.startTime
		} else {
			this.shiftTime = 0
		}
	};
	s7sdk.common.Animation.prototype.stopTransition = function(a) {
		if (this.viewParent != null && this.viewParent.animationStop != null) {
			this.viewParent.animationStop(a)
		}
	}
};