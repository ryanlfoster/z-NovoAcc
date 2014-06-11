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
s7sdk.pkg("s7sdk.video");
s7sdk.Util.require("s7sdk.common.Button");
s7sdk.Util.require("s7sdk.event.Event");
if (!s7sdk.video.VideoTime) {
	s7sdk.video.VideoTime = function VideoTime(a, c, b) {
		b = (typeof b == "string" && b.length) ? b : "VideoTime_"
				+ s7sdk.Util.createUniqueId();
		arguments.callee.superclass.apply(this,
				[ b, a, "div", "s7videotime", c ]);
		this.createElement();
		this.container = s7sdk.Util.byId(a);
		this.playedTime = 0;
		this.duration = 0;
		this.content = document.createElement("div");
		this.setText();
		this.obj.appendChild(this.content);
		this.container.appendChild(this.obj);
		this.obj.videoTimeObj = this;
		this.hint = this.getLocalizedText("TOOLTIP");
		if (this.hint && this.hint.length) {
			this.toolTip = new s7sdk.SimpleToolTip(this.obj, this.hint,
					this.obj)
		}
	};
	s7sdk.Class.inherits("s7sdk.video.VideoTime", "s7sdk.UIComponent");
	s7sdk.video.VideoTime.prototype.symbols = {
		TOOLTIP : "Video Time"
	};
	s7sdk.video.VideoTime.prototype.modifiers = {
		timePattern : {
			params : [ "timepattern" ],
			defaults : [ "m:ss" ]
		},
		showDuration : {
			params : [ "showduration" ],
			defaults : [ true ]
		}
	};
	s7sdk.video.VideoTime.prototype.hide = function() {
		this.obj.style.visibility = "hidden"
	};
	s7sdk.video.VideoTime.prototype.show = function(a, b) {
		this.obj.style.visibility = "inherit";
		this.obj.style.left = a + "px";
		this.obj.style.top = (b - this.obj.clientHeight) + "px"
	};
	s7sdk.video.VideoTime.prototype.getPlayedTime = function() {
		return this.playedTime
	};
	s7sdk.video.VideoTime.prototype.setPlayedTime = function(a) {
		this.playedTime = a;
		this.setText()
	};
	s7sdk.video.VideoTime.prototype.getDuration = function() {
		return this.duration
	};
	s7sdk.video.VideoTime.prototype.setDuration = function(a) {
		this.duration = a;
		this.setText()
	};
	s7sdk.video.VideoTime.prototype.toFormattedTimeString = function(d) {
		if (!isFinite(d)) {
			d = 0
		}
		var g = Math.floor(d / 3600000);
		var c = d - g * 3600;
		var e = Math.floor(c / 60000);
		var h = Math.floor((c % 60000) / 1000);
		var b = this.timePattern;
		var i = false;
		var a = false;
		if (b.match(/(hh+)/i) != null) {
			b = b.replace(b.match(/(hh+)/i)[0], g.toString());
			i = true
		}
		if (b.match(/(h+)/i) != null) {
			b = b.replace(b.match(/(h+)/i)[0], g.toString());
			i = true
		}
		if (!i) {
			e += g * 60
		}
		var f = e.toString();
		if (b.match(/(mm+)/i) != null) {
			f = f.length == 1 ? "0" + f : f;
			b = b.replace(b.match(/(mm+)/i)[0], f);
			a = true
		} else {
			if (b.match(/(m+)/i) != null) {
				b = b.replace(b.match(/(m+)/i)[0], f);
				a = true
			}
		}
		if (a) {
			f = h.toString();
			if (b.match(/(ss+)/i) != null) {
				f = f.length == 1 ? "0" + f : f;
				b = b.replace(b.match(/(ss+)/i)[0], f)
			} else {
				if (b.match(/(s+)/i) != null) {
					b = b.replace(b.match(/(s+)/i)[0], f)
				}
			}
		} else {
			if (!i) {
				f = g * 60 + e * 60 + h.toString();
				if (b.match(/(s+)/i) != null) {
					b = b.replace(b.match(/(s+)/i)[0], f)
				}
			} else {
				b = ""
			}
		}
		return b
	};
	s7sdk.video.VideoTime.prototype.setText = function() {
		var a = this.toFormattedTimeString(this.playedTime)
				+ (this.showDuration ? " / "
						+ this.toFormattedTimeString(this.duration) : "");
		this.content.innerHTML = a
	};
	s7sdk.VideoTime = s7sdk.video.VideoTime;
	(function addDefaultCSS() {
		var b = s7sdk.Util.css.createCssRuleText;
		var a = b(".s7videotime", {
			position : "absolute",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)",
			"font-family" : "Arial, Helvetica, sans-serif",
			"font-size" : "12px",
			padding : "4px"
		});
		s7sdk.Util.css.addDefaultCSS(a, "VideoTime")
	})()
}
if (!s7sdk.video.VideoScrubber) {
	s7sdk.video.VideoScrubber = function VideoScrubber(c, e, d) {
		d = (typeof d == "string" && d.length) ? d : "VideoScrubber_"
				+ s7sdk.Util.createUniqueId();
		arguments.callee.superclass.apply(this, [ d, c, "div",
				"s7videoscrubber", e ]);
		this.createElement();
		this.container = s7sdk.Util.byId(c);
		this.playedTime = 0;
		this.loadedPosition = 0;
		this.duration = 0;
		this.inDrag = false;
		this.offsetX = 0;
		this.videoTime = 0;
		this.track = s7sdk.Util.createObj(null, "div", null, "s7track");
		this.obj.appendChild(this.track);
		this.trackloaded = s7sdk.Util.createObj(null, "div", null,
				"s7trackloaded");
		this.trackloaded.style.width = 0;
		this.obj.appendChild(this.trackloaded);
		this.trackplayed = s7sdk.Util.createObj(null, "div", null,
				"s7trackplayed");
		this.trackplayed.style.width = 0;
		this.obj.appendChild(this.trackplayed);
		this.knob = s7sdk.Util.createObj(null, "div", null, "s7knob");
		this.obj.appendChild(this.knob);
		this.container.appendChild(this.obj);
		this.inTouch = false;
		if (this.showTime) {
			var a = new s7sdk.ParameterManager();
			a.push("showduration", "0");
			a.push("timepattern", this.timePattern);
			this.videoTime = new s7sdk.video.VideoTime(d, a, d + "Time");
			this.videoTime.setPlayedTime(0);
			this.videoTime.show(this.knob.offsetLeft
					+ (this.knob.offsetWidth - this.videoTime.obj.offsetWidth)
					/ 2, 0);
			this.videoTime.hide()
		}
		var b = this;
		this.addEventListener("mousedown", function(f) {
			b.handleMouse(f, 1)
		});
		this.addEventListener("mouseup", function(f) {
			b.handleMouse(f, 2)
		});
		s7sdk.Event.addDOMListener(this.knob, "touchstart", function(f) {
			b.handleTouch(f, 1)
		}, true);
		s7sdk.Event.addDOMListener(this.knob, "touchend", function(f) {
			b.handleTouch(f, 2)
		}, true);
		s7sdk.Event.addDOMListener(this.knob, "touchmove", function(f) {
			b.handleTouch(f, 3)
		}, true);
		this.obj.videoScrubberObj = this;
		this.winMouseMoveHandler = function(f) {
			b.winMouseMove(f)
		};
		this.winMouseUpHandler = function(f) {
			b.winMouseUp(f)
		};
		this.hint = this.getLocalizedText("TOOLTIP");
		if (this.hint && this.hint.length) {
			this.toolTip = new s7sdk.SimpleToolTip(this.obj, this.hint,
					this.obj);
			if (this.toolTip && this.toolTip.toolTip_) {
				this.toolTipVis = this.toolTip.toolTip_.style.visibility
			}
		}
	};
	s7sdk.Class.inherits("s7sdk.video.VideoScrubber", "s7sdk.UIComponent");
	s7sdk.video.VideoScrubber.prototype.symbols = {
		TOOLTIP : "Seek Video"
	};
	s7sdk.video.VideoScrubber.prototype.modifiers = {
		timePattern : {
			params : [ "timepattern" ],
			defaults : [ "m:ss" ]
		},
		showTime : {
			params : [ "showtime" ],
			defaults : [ true ]
		}
	};
	s7sdk.video.VideoScrubber.prototype.addEventListener = function(c, b, a) {
		this.superproto.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.video.VideoScrubber.prototype.getPlayedTime = function() {
		return this.playedTime
	};
	s7sdk.video.VideoScrubber.prototype.setPlayedTime = function(a) {
		this.playedTime = a;
		if (this.duration == 0) {
			return
		} else {
			if (a > this.duration) {
				this.playedTime = this.duration
			}
		}
		this.trackplayed.style.width = ((this.playedTime / this.duration) * this.track.clientWidth)
				+ "px";
		if (!this.inTouch) {
			this.updateKnob()
		}
	};
	s7sdk.video.VideoScrubber.prototype.getLoadedPosition = function() {
		return this.loadedPosition
	};
	s7sdk.video.VideoScrubber.prototype.setLoadedPosition = function(a) {
		this.loadedPosition = a;
		if (this.duration == 0) {
			return
		} else {
			this.trackloaded.style.width = ((this.loadedPosition / this.duration) * this.track.clientWidth)
					+ "px"
		}
	};
	s7sdk.video.VideoScrubber.prototype.getPosition = function() {
		var a = this.knob.offsetLeft + this.knob.offsetWidth / 2;
		return (a - this.track.offsetLeft) / this.track.offsetWidth
	};
	s7sdk.video.VideoScrubber.prototype.setPosition = function(a) {
		var b = this.track.offsetLeft + Math.min(1, Math.max(0, a))
				* this.track.offsetWidth - this.knob.offsetWidth / 2;
		this.knob.style.left = b + "px"
	};
	s7sdk.video.VideoScrubber.prototype.getDuration = function() {
		return this.duration
	};
	s7sdk.video.VideoScrubber.prototype.setDuration = function(a) {
		this.duration = a;
		this.updateKnob();
		this.setLoadedPosition(this.loadedPosition)
	};
	s7sdk.video.VideoScrubber.prototype.updateKnob = function() {
		if ((!this.inDrag) && (this.duration > 0)) {
			this.knob.style.left = (this.track.offsetLeft
					+ (this.playedTime / this.duration)
					* this.track.clientWidth - this.knob.clientWidth / 2)
					+ "px"
		}
	};
	s7sdk.video.VideoScrubber.prototype.winMouseMove = function(a) {
		this.moveTo(a.clientX);
		if (this.videoTime) {
			this.videoTime.setPlayedTime(this.getPosition()
					* this.getDuration());
			this.videoTime.show(this.knob.offsetLeft
					+ (this.knob.offsetWidth - this.videoTime.obj.offsetWidth)
					/ 2, 0)
		}
		this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
	};
	s7sdk.video.VideoScrubber.prototype.winMouseUp = function(a) {
		if (this.inDrag) {
			this.inDrag = false;
			var b = s7sdk.browser.name == "ie" ? document : window;
			s7sdk.Event.removeDOMListener(b, "mousemove",
					this.winMouseMoveHandler, true);
			s7sdk.Event.removeDOMListener(b, "mouseup", this.winMouseUpHandler,
					true);
			this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
		}
		if (this.videoTime) {
			this.videoTime.hide()
		}
		if (this.toolTip && this.toolTip.toolTip_) {
			this.toolTip.toolTip_.style.visibility = this.toolTipVis
		}
	};
	s7sdk.video.VideoScrubber.prototype.handleMouse = function(b, d) {
		s7sdk.Event.preventDefault(b);
		s7sdk.Event.stopPropagation(b);
		if (d == 1) {
			var a = (b.target || b.srcElement);
			if (a != this.knob) {
				this.offsetX = 0;
				this.moveTo(b.clientX - s7sdk.Util.getObjPos(this.track).x);
				this
						.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP);
				return
			}
			this.offsetX = b.clientX - this.knob.offsetLeft;
			this.lastX = b.clientX;
			this.inDrag = true;
			if (this.videoTime) {
				this.videoTime.setPlayedTime(this.getPlayedTime());
				this.videoTime
						.show(
								this.knob.offsetLeft
										+ (this.knob.offsetWidth - this.videoTime.obj.offsetWidth)
										/ 2, 0)
			}
			var e = s7sdk.browser.name == "ie" ? document : window;
			s7sdk.Event.addDOMListener(e, "mousemove",
					this.winMouseMoveHandler, true);
			s7sdk.Event.addDOMListener(e, "mouseup", this.winMouseUpHandler,
					true);
			var c = new s7sdk.event.SliderEvent(
					s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN, this
							.getPosition(), true);
			s7sdk.Event.dispatch(this.obj, c, false);
			if (this.toolTip && this.toolTip.toolTip_) {
				this.toolTip.toolTip_.style.visibility = "hidden"
			}
		} else {
			if (this.videoTime) {
				this.videoTime.hide()
			}
			this.winMouseUp(b)
		}
	};
	s7sdk.video.VideoScrubber.prototype.handleTouch = function(a, b) {
		s7sdk.Event.preventDefault(a);
		s7sdk.Event.stopPropagation(a);
		if (b == 1) {
			if (a.target == this.knob) {
				this.offsetX = a.targetTouches[0].clientX
						- this.knob.offsetLeft;
				this.lastX = a.targetTouches[0].clientX;
				this.inTouch = true;
				if (this.videoTime) {
					this.videoTime.setPlayedTime(this.getPlayedTime());
					this.videoTime
							.show(
									this.knob.offsetLeft
											+ (this.knob.offsetWidth - this.videoTime.obj.offsetWidth)
											/ 2, 0)
				}
				this
						.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN)
			} else {
				this.offsetX = 0;
				this.moveTo(a.targetTouches[0].clientX
						- s7sdk.Util.getObjPos(this.track).x);
				this
						.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
			}
		} else {
			if (b == 2) {
				if (this.inTouch) {
					this.inTouch = false;
					this
							.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
				}
				if (this.videoTime) {
					this.videoTime.hide()
				}
			} else {
				if (b == 3) {
					this.moveTo(a.targetTouches[0].clientX);
					if (this.videoTime) {
						this.videoTime.setPlayedTime(this.getPosition()
								* this.getDuration());
						this.videoTime
								.show(
										this.knob.offsetLeft
												+ (this.knob.offsetWidth - this.videoTime.obj.offsetWidth)
												/ 2, 0)
					}
					this
							.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
				}
			}
		}
	};
	s7sdk.video.VideoScrubber.prototype.moveTo = function(b) {
		var c = b - this.offsetX;
		var a = this.track.offsetLeft - this.knob.offsetWidth / 2;
		c = Math.min(Math.max(a, c), a + this.track.offsetWidth);
		this.knob.style.left = c + "px"
	};
	s7sdk.video.VideoScrubber.prototype.dispatchSliderEvent = function(a) {
		var b = new s7sdk.event.SliderEvent(a, this.getPosition(), true);
		s7sdk.Event.dispatch(this.obj, b, false)
	};
	s7sdk.video.VideoScrubber.prototype.resize = function(a, d) {
		var f = parseInt(s7sdk.Util.getStyle(this.obj, "width").replace("px",
				""));
		var c = parseInt(s7sdk.Util.getStyle(this.obj, "height").replace("px",
				""));
		if (f == a && c == d) {
			return
		}
		var e = this.getPlayedTime();
		var b = this.getLoadedPosition();
		f = a > 0 ? a : 1;
		c = d > 0 ? d : 1;
		this.obj.style.width = f + "px";
		this.obj.style.height = c + "px";
		this.setLoadedPosition(b);
		this.setPlayedTime(e)
	};
	s7sdk.VideoScrubber = s7sdk.video.VideoScrubber;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7videoscrubber", {
			position : "absolute",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)",
			width : "235px",
			height : "26px"
		}) + c(".s7videoscrubber .s7videotime", {
			position : "absolute",
			"font-family" : "Arial, Helvetica, sans-serif",
			"font-size" : "12px",
			left : "4px",
			width : "46px",
			height : "24px",
			padding : "8px",
			"background-image" : b("scrub_time.png"),
			align : "center",
			"text-align" : "center",
			"vertical-align" : "middle",
			color : "#000000"
		}) + c(".s7track, .s7trackloaded, .s7trackplayed", {
			position : "absolute",
			left : "8px",
			right : "8px",
			top : "35%",
			height : "31%"
		}) + c(".s7videoscrubber .s7track", {
			"background-color" : "#555555"
		}) + c(".s7videoscrubber .s7trackloaded", {
			"z-index" : "100",
			"background-color" : "#666666"
		}) + c(".s7videoscrubber .s7trackplayed", {
			"z-index" : "200",
			"background-color" : "#999999"
		}) + c(".s7videoscrubber .s7knob", {
			position : "absolute",
			width : "9px",
			top : "23%",
			height : "54%",
			"background-image" : "none",
			"background-color" : "#ffffff",
			"z-index" : "1000"
		});
		s7sdk.Util.css.addDefaultCSS(a, "VideoScrubber")
	})()
}
if (!s7sdk.video.VerticalVolume) {
	s7sdk.video.VerticalVolume = function VerticalVolume(a, c, b) {
		b = (typeof b == "string" && b.length) ? b : "VerticalVolume_"
				+ s7sdk.Util.createUniqueId();
		arguments.callee.superclass.apply(this, [ b, a, "div",
				"s7verticalvolume", c ]);
		this.createElement();
		this.container = s7sdk.Util.byId(a);
		this.buildVolume()
	};
	s7sdk.Class.inherits("s7sdk.video.VerticalVolume", "s7sdk.UIComponent");
	s7sdk.video.VerticalVolume.prototype.symbols = {
		TOOLTIP : ""
	};
	s7sdk.video.VerticalVolume.prototype.buildVolume = function() {
		this.inTouch = false;
		this.offsetY = 0;
		this.timer = 0;
		this.track = s7sdk.Util.createObj(null, "div", null, "s7track");
		this.obj.appendChild(this.track);
		this.filledtrack = s7sdk.Util.createObj(null, "div", null,
				"s7filledtrack");
		this.track.appendChild(this.filledtrack);
		this.knob = s7sdk.Util.createObj(null, "div", null, "s7knob");
		this.obj.appendChild(this.knob);
		this.container.appendChild(this.obj);
		var a = this;
		this.__mouseDown = function(b) {
			a.WmouseDown(b)
		};
		this.__mouseOver = function(b) {
			if (a.timer) {
				clearTimeout(a.timer)
			}
		};
		this.__mouseOut = function(c) {
			var b = c.relatedTarget || c.toElement;
			if (b == a.obj || b == this.track || b == this.knob
					|| b == a.obj.parent) {
				a.preventDefault(c)
			}
		};
		this.__WmouseMove = function(b) {
			a.WmouseMove(b)
		};
		this.__WmouseUp = function(b) {
			a.WmouseUp(b)
		};
		s7sdk.Event.addDOMListener(this.obj, "mousedown", this.__mouseDown,
				false);
		s7sdk.Event.addDOMListener(this.obj, "mouseover", this.__mouseOver,
				false);
		s7sdk.Event.addDOMListener(this.obj, "mouseout", this.__mouseOut, true);
		s7sdk.Event.addDOMListener(this.knob, "touchstart", function(b) {
			a.handleTouch(b, 1)
		}, true);
		s7sdk.Event.addDOMListener(this.knob, "touchend", function(b) {
			a.handleTouch(b, 2)
		}, true);
		s7sdk.Event.addDOMListener(this.knob, "touchmove", function(b) {
			a.handleTouch(b, 3)
		}, true);
		this.setPosition(1);
		this.canHide = true
	};
	s7sdk.video.VerticalVolume.prototype.WmouseDown = function(b) {
		this.preventDefault(b);
		var a = (b.target || b.srcElement);
		if (a != this.knob) {
			return
		}
		this.offsetY = b.clientY - this.knob.offsetTop;
		this.lastY = b.clientY;
		this.inDrag = true;
		var d = s7sdk.browser.name == "ie" ? document : window;
		s7sdk.Event.addDOMListener(d, "mousemove", this.__WmouseMove, true);
		s7sdk.Event.addDOMListener(d, "mouseup", this.__WmouseUp, true);
		var c = new s7sdk.event.SliderEvent(
				s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN, this.getPosition(),
				false);
		s7sdk.Event.dispatch(this.obj, c, false)
	};
	s7sdk.video.VerticalVolume.prototype.WmouseMove = function(a) {
		this.moveTo(a.clientY);
		this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
	};
	s7sdk.video.VerticalVolume.prototype.WmouseUp = function(a) {
		this.preventDefault(a);
		if (this.inDrag) {
			this.inDrag = false;
			var b = s7sdk.browser.name == "ie" ? document : window;
			s7sdk.Event.removeDOMListener(b, "mousemove", this.__WmouseMove,
					true);
			s7sdk.Event.removeDOMListener(b, "mouseup", this.__WmouseUp, true);
			this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
		}
	};
	s7sdk.video.VerticalVolume.prototype.handleTouch = function(a, b) {
		if (b != 3) {
			this.preventDefault(a)
		}
		if (b == 1) {
			this.offsetY = a.targetTouches[0].clientY - this.knob.offsetTop;
			this.lastY = a.targetTouches[0].clientY;
			this.inTouch = true;
			this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN)
		} else {
			if (b == 2) {
				if (this.inTouch) {
					this.inTouch = false;
					this
							.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
				}
			} else {
				if (b == 3) {
					this.moveTo(a.targetTouches[0].clientY);
					var c = this.getPosition();
					if (this.prevPosCheck != c) {
						this.prevPosCheck = c;
						this
								.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
					}
				}
			}
		}
	};
	s7sdk.video.VerticalVolume.prototype.preventDefault = function(a) {
		s7sdk.Event.preventDefault(a);
		s7sdk.Event.stopPropagation(a)
	};
	s7sdk.video.VerticalVolume.prototype.getPosition = function() {
		var b = this.knob.offsetTop + this.knob.offsetHeight / 2;
		var a = Math.abs(b - this.track.offsetTop - this.track.offsetHeight);
		return Math.min(1, Math.max(0, a < 1 ? 0
				: (1 - (b - this.track.offsetTop) / this.track.offsetHeight)))
	};
	s7sdk.video.VerticalVolume.prototype.setPosition = function(a) {
		var b = this.track.offsetTop + Math.min(1, Math.max(0, 1 - a))
				* this.track.offsetHeight - this.knob.offsetHeight / 2;
		this.knob.style.top = b + "px";
		this.setFilledTrack(b);
		this.dispatchSliderEvent(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
	};
	s7sdk.video.VerticalVolume.prototype.setFilledTrack = function(d) {
		var a = Math
				.ceil(d + this.knob.offsetHeight / 2 - this.track.offsetTop);
		this.filledtrack.style.top = a + "px";
		var c = Math.ceil(this.track.offsetTop + this.track.offsetHeight - d
				- this.knob.offsetHeight / 2);
		var b = this.track.offsetHeight - (a + c);
		this.filledtrack.style.height = (c + b) + "px"
	};
	s7sdk.video.VerticalVolume.prototype.show = function() {
		this.obj.style.visibility = "inherit"
	};
	s7sdk.video.VerticalVolume.prototype.hide = function(b) {
		var c = this;
		function a() {
			if (!c.canHide || c.inTouch) {
				return
			}
			c.obj.style.visibility = "hidden";
			if (c.timer) {
				clearInterval(c.timer)
			}
		}
		if (b > 0) {
			if (c.timer) {
				clearInterval(c.timer)
			}
			this.timer = setInterval(a, b)
		} else {
			a()
		}
	};
	s7sdk.video.VerticalVolume.prototype.moveTo = function(a) {
		var b = a - this.offsetY;
		var c = this.track.offsetTop - this.knob.offsetHeight / 2;
		b = Math.min(Math.max(c, b), c + this.track.offsetHeight);
		this.knob.style.top = b + "px";
		this.setFilledTrack(b)
	};
	s7sdk.video.VerticalVolume.prototype.dispatchSliderEvent = function(a) {
		var b = new s7sdk.event.SliderEvent(a, this.getPosition(), true);
		s7sdk.Event.dispatch(this.obj, b, false)
	};
	s7sdk.VerticalVolume = s7sdk.video.VerticalVolume;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7verticalvolume", {
			position : "absolute",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)",
			width : "25px",
			height : "80px",
			"background-color" : "#ccc"
		}) + c(".s7verticalvolume .s7track", {
			position : "absolute",
			top : "12px",
			left : "10px",
			width : "5px",
			height : "55px",
			"background-color" : "#737373"
		}) + c(".s7verticalvolume .s7filledtrack", {
			position : "absolute",
			left : "0px",
			width : "5px",
			"background-color" : "#ffffff"
		}) + c(".s7verticalvolume .s7knob", {
			position : "absolute",
			width : "13px",
			height : "13px",
			top : "6px",
			left : "6px",
			"background-image" : b("volume_knob.png")
		});
		s7sdk.Util.css.addDefaultCSS(a, "VerticalVolume")
	})()
}
if (!s7sdk.video.MutableVolume) {
	s7sdk.video.MutableVolume = function MutableVolume(a, c, b) {
		b = (typeof b == "string" && b.length) ? b : "MutableVolume_"
				+ s7sdk.Util.createUniqueId();
		arguments.callee.superclass.apply(this, [ b, a, "div",
				"s7mutablevolume", c ]);
		this.createElement();
		this.container = s7sdk.Util.byId(a);
		this.container.appendChild(this.obj);
		this.buildMutableVolume(b, c)
	};
	s7sdk.Class.inherits("s7sdk.video.MutableVolume", "s7sdk.UIComponent");
	s7sdk.video.MutableVolume.prototype.symbols = {
		TOOLTIP_SELECTED : "Video Volume",
		TOOLTIP_UNSELECTED : "Video Volume"
	};
	s7sdk.video.MutableVolume.prototype.addEventListener = function(c, b, a) {
		this.superproto.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.video.MutableVolume.prototype.buildMutableVolume = function(b, c) {
		this.mutebtn = new s7sdk.common.TwoStateButton("mute_"
				+ s7sdk.Util.createUniqueId(), this.id, 0, 0, "s7mutebutton",
				c, true);
		var e = parseInt(s7sdk.Util.css.getCss("s7mutablevolume", "width",
				this.id, null, this.container));
		var a = parseInt(s7sdk.Util.css.getCss("s7mutablevolume", "height",
				this.id, null, this.container));
		this.mutebtn.obj.style.width = e + "px";
		this.mutebtn.obj.style.height = a + "px";
		this.mutebtn.symbols = this.symbols;
		this.mutebtn.toolTipSelected = this
				.getLocalizedText("TOOLTIP_SELECTED");
		this.mutebtn.toolTipUnselected = this
				.getLocalizedText("TOOLTIP_UNSELECTED");
		if (this.mutebtn.toolTipSelected || this.mutebtn.toolTipUnselected) {
			this.mutebtn.toolTip_ = new s7sdk.SimpleToolTip(this.mutebtn.obj,
					this.mutebtn.toolTipSelected, this.mutebtn.obj)
		}
		this.activated = true;
		this.verticalVolume = new s7sdk.video.VerticalVolume(b, c, null);
		this.verticalVolume.obj.style.top = (-this.verticalVolume.obj.clientHeight)
				+ "px";
		var d = this;
		this.verticalVolume.hide(0);
		if (!("ontouchstart" in window)) {
			this.addEventListener("mouseover", function() {
				d.componentRollover()
			});
			this.addEventListener("mouseout", function() {
				d.componentRollout()
			}, true);
			this.enableClck = true
		} else {
			this.enableClck = false
		}
		this.mutebtn.addEventListener("touchstart", function() {
			d.enableClck = true
		}, false);
		this.mutebtn.addEventListener("touchend", function() {
			d.enableClck = false
		}, false);
		this.verticalVolume.addEventListener(
				s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN, function(f) {
					d
							.onVolumeSlide(f,
									s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN)
				}, false);
		this.verticalVolume.addEventListener(
				s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE, function(f) {
					d
							.onVolumeSlide(f,
									s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE)
				}, false);
		this.verticalVolume.addEventListener(
				s7sdk.event.SliderEvent.NOTF_SLIDER_UP, function(f) {
					d.onVolumeSlide(f, s7sdk.event.SliderEvent.NOTF_SLIDER_UP)
				}, false);
		this.prevPos = 0;
		this.prevPosCheck = 0;
		this.setSelected(false);
		this.setPosition(1);
		var d = this;
		s7sdk.Event.addDOMListener(this.mutebtn.obj, "click", function(f) {
			f = f || window.event;
			if (d.enableClck) {
				d.componentClick(f)
			}
		}, false)
	};
	s7sdk.video.MutableVolume.prototype.onVolumeSlide = function(b, a) {
		if ("ontouchstart" in window) {
			this.componentRollout(1500)
		}
		if (this.mutebtn.selected) {
			if (b.s7event.position != 0) {
				this.mutebtn.setSelected(false)
			}
		} else {
			if (b.s7event.position == 0) {
				this.setSelected(true)
			}
		}
		var c = this.getPosition();
		if (s7sdk.browser.name == "ie" && s7sdk.browser.version.major < 9) {
			if (a == s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE) {
				if (this.prevPosCheck != c) {
					s7sdk.Event.dispatch(this.obj,
							new s7sdk.event.SliderEvent(
									s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE,
									c, false), false)
				}
			} else {
				if (a == s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN) {
					s7sdk.Event.dispatch(this.obj,
							new s7sdk.event.SliderEvent(
									s7sdk.event.SliderEvent.NOTF_SLIDER_DOWN,
									c, false), false)
				} else {
					s7sdk.Event.dispatch(this.obj, new s7sdk.event.SliderEvent(
							a, c, false), false)
				}
			}
			this.prevPosCheck = c;
			this.mutebtn.obj.focus()
		}
	};
	s7sdk.video.MutableVolume.prototype.componentClick = function() {
		if (!this.activated) {
			return
		}
		if ("ontouchstart" in window) {
			if (this.verticalVolume.obj.style.visibility != "hidden") {
				this.verticalVolume.canHide = false;
				this.setSelected(!this.mutebtn.selected);
				this.componentRollout(1500)
			} else {
				this.componentRollout(1500);
				this.verticalVolume.show()
			}
		} else {
			this.setSelected(!this.mutebtn.selected)
		}
	};
	s7sdk.video.MutableVolume.prototype.componentRollover = function() {
		this.verticalVolume.obj.style.top = (-this.verticalVolume.obj.clientHeight)
				+ "px";
		this.verticalVolume.canHide = false;
		this.verticalVolume.show()
	};
	s7sdk.video.MutableVolume.prototype.componentRollout = function(b) {
		var a = typeof (b) != "undefined" ? b : 500;
		this.verticalVolume.canHide = true;
		this.verticalVolume.hide(a)
	};
	s7sdk.video.MutableVolume.prototype.setSelected = function(a) {
		this.mutebtn.setSelected(a);
		if (this.mutebtn.selected) {
			this.prevPos = this.verticalVolume.getPosition();
			this.verticalVolume.setPosition(0)
		} else {
			this.verticalVolume.setPosition(this.prevPos == 0 ? 1
					: this.prevPos)
		}
	};
	s7sdk.video.MutableVolume.prototype.isSelected = function() {
		return this.mutebtn.isSelected()
	};
	s7sdk.video.MutableVolume.prototype.setPosition = function(a) {
		this.verticalVolume.setPosition(a);
		this.mutebtn.setSelected(a == 0)
	};
	s7sdk.video.MutableVolume.prototype.getPosition = function() {
		return this.verticalVolume.getPosition()
	};
	s7sdk.video.MutableVolume.prototype.activate = function() {
		if (this.activated) {
			return
		}
		this.activated = true;
		this.mutebtn.activate();
		this.enableEvent(null)
	};
	s7sdk.video.MutableVolume.prototype.deactivate = function() {
		if (!this.activated) {
			return
		}
		this.activated = false;
		this.mutebtn.deactivate();
		this.disableEvent(null)
	};
	s7sdk.MutableVolume = s7sdk.video.MutableVolume;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7mutablevolume", {
			position : "absolute",
			width : "25px",
			height : "25px",
			"-webkit-touch-callout" : "none",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)"
		})
				+ c(".s7mutablevolume .s7mutebutton", {
					position : "absolute",
					"background-size" : "contain",
					"background-repeat" : "no-repeat",
					"background-position" : "center"
				})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='true'][state='up']",
						{
							"background-image" : b("muteon_up.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='true'][state='over']",
						{
							"background-image" : b("muteon_over.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='true'][state='down']",
						{
							"background-image" : b("muteon_down.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='true'][state='disabled']",
						{
							"background-image" : b("muteon_disabled.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='false'][state='up']",
						{
							"background-image" : b("muteoff_up.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='false'][state='over']",
						{
							"background-image" : b("muteoff_over.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='false'][state='down']",
						{
							"background-image" : b("muteoff_down.png")
						})
				+ c(
						".s7mutablevolume .s7mutebutton[selected='false'][state='disabled']",
						{
							"background-image" : b("muteoff_disabled.png")
						}) + c(".s7mutablevolume .s7verticalvolume", {
					position : "absolute",
					width : "25px",
					height : "80px",
					left : "0px",
					"background-color" : "#ccc"
				}) + c(".s7mutablevolume .s7verticalvolume .s7track", {
					position : "absolute",
					top : "12px",
					left : "10px",
					width : "5px",
					height : "55px",
					"background-color" : "#737373"
				}) + c(".s7mutablevolume .s7verticalvolume .s7filledtrack", {
					position : "absolute",
					left : "0px",
					width : "5px",
					"background-color" : "#ffffff"
				}) + c(".s7mutablevolume .s7verticalvolume .s7knob", {
					position : "absolute",
					width : "13px",
					height : "13px",
					top : "6px",
					left : "6px",
					"background-image" : b("volume_knob.png")
				});
		s7sdk.Util.css.addDefaultCSS(a, "MutableVolume")
	})()
};