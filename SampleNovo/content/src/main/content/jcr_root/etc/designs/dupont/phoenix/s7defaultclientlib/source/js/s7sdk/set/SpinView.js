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
s7sdk.pkg("s7sdk.set");
if (s7sdk.browser.name === "ie") {
	s7sdk.Util.require("s7sdk.image.rgn.View")
} else {
	s7sdk.Util.require("s7sdk.image.View")
}
s7sdk.Util.require("s7sdk.set.SpinFrame");
s7sdk.Util.require("s7sdk.image.Tile");
s7sdk.Util.require("s7sdk.common.IS");
s7sdk.Util.require("s7sdk.common.Enumeration");
s7sdk.Util.require("s7sdk.common.IconEffect");
s7sdk.Util.require("s7sdk.common.ItemDesc");
s7sdk.Util.require("s7sdk.event.Event");
s7sdk.Util.require("s7sdk.event.InputController");
if (!s7sdk.set.SpinView) {
	s7sdk.set.SpinView = function SpinView(a, d, c) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.CONFIG,
						"s7sdk.set.SpinView constructor - containerId: %0, settings: %1 , compId: %2",
						a, d, c);
		arguments.callee.superclass.apply(this,
				[ c, a, "div", "s7spinview", d ]);
		this.createElement();
		this.uiContainer = s7sdk.Util.byId(a);
		if (this.uiContainer.tagName == "DIV"
				&& (!this.uiContainer.style.position || this.uiContainer.style.position == "static")) {
			this.uiContainer.style.position = "relative"
		}
		this.id = (s7sdk.Util.isNull(c) ? "" : c);
		if (this.serverUrl.lastIndexOf("/") != (this.serverUrl.length - 1)) {
			this.serverUrl += "/"
		}
		this.wid = this.stagesize.width;
		this.hei = this.stagesize.height;
		if (this.wid == 0 || this.hei == 0) {
			this.wid = this.size.width;
			this.hei = this.size.height
		}
		if (this.wid == 0 || this.hei == 0) {
			this.wid = parseInt(s7sdk.Util.css.getCss("s7spinview", "width",
					this.id, null, this.uiContainer));
			this.hei = parseInt(s7sdk.Util.css.getCss("s7spinview", "height",
					this.id, null, this.uiContainer));
			if (!s7sdk.Util.isNumber(this.wid)
					|| !s7sdk.Util.isNumber(this.hei) || this.wid <= 0
					|| this.hei <= 0) {
				if ("clientHeight" in this.uiContainer
						&& "clientWidth" in this.uiContainer) {
					this.wid = this.uiContainer.clientWidth;
					this.hei = this.uiContainer.clientHeight
				}
				if (this.wid == 0 || this.hei == 0) {
					this.wid = 400;
					this.hei = 400
				}
			}
		}
		if (this.iscommand == "") {
			this.iscommand = this.modifier
		}
		this.locale = this.getParam("locale", "");
		this.bgColor = s7sdk.Util.css.getCss("s7spinview", "background-color",
				this.id, null, this.uiContainer);
		this.bgColor = s7sdk.Util.convertColor(this.bgColor, "flash");
		this.clickToZoom = 0;
		if ((/reset/i).test(this.singleclick)) {
			this.clickToZoom |= s7sdk.Enum.CLICK_STATE.CLICK_TO_RESET
		}
		if ((/zoom/i).test(this.singleclick)) {
			this.clickToZoom |= s7sdk.Enum.CLICK_STATE.CLICK_TO_ZOOM
		}
		if ((/reset/i).test(this.doubleclick)) {
			this.clickToZoom |= s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_RESET
		}
		if ((/zoom/i).test(this.doubleclick)) {
			this.clickToZoom |= s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_ZOOM
		}
		this.spinSet = this.asset;
		this.spinSetArray = [];
		this.spinSetFrames = [];
		this.spinSetItems = [];
		this.imageModifier = s7sdk.MediaSetParser
				.parseAssetForSetReq(this.spinSet).mod;
		this.buttonMode = true;
		this.useHandCursor = true;
		this.viewState = 0;
		this.panSpinMode = true;
		this.currentFrame = null;
		this.frameInvalidated = false;
		this.nextFrame = null;
		this.paused = false;
		this.frameQueue = new Array();
		this.frameSpeed = 1;
		this.idleSpeed = -1;
		this.dragToSpin = true;
		this.smoothFactor = 0.1;
		this.t = 0;
		this.maxRadius = this.maxLoadRadius > 0 ? this.maxLoadRadius : 1;
		this.frame = -1;
		this.lastScale = 100;
		this.mouseIsDown = false;
		this.currentSpinState = null;
		this.wrapVertical = false;
		this.wrapHorizontal = false;
		this.lastTime = 0;
		this.createWaitOverlay();
		this.frameLoader = new s7sdk.SpinFrameLoader();
		if (this.enableHD.enable.toLowerCase() == "always") {
			this.enableHD.maxHdPixels = -1
		} else {
			if (this.enableHD.enable.toLowerCase() == "never") {
				this.enableHD.maxHdPixels = 0
			} else {
				if (this.enableHD.enable.toLowerCase() == "limit") {
					if (NaN == this.enableHD.maxHdPixels) {
						this.enableHD.maxHdPixels = 2250000
					} else {
						this.enableHD.maxHdPixels = this.enableHD.maxHdPixels
								* this.enableHD.maxHdPixels
					}
				} else {
					this.enableHD.maxHdPixels = 2250000
				}
			}
		}
		this.devicePixelRatio = s7sdk.Util.adjustDevicePixelRatio(
				this.enableHD.maxHdPixels, this.hei, this.wid);
		this.viewProps = new Object();
		this.viewProps.fmt = this.fmt;
		this.viewProps.outHeight = this.hei * this.devicePixelRatio;
		this.viewProps.outWidth = this.wid * this.devicePixelRatio;
		this.viewProps.resetHeight = this.hei * this.devicePixelRatio;
		this.viewProps.resetWidth = this.wid * this.devicePixelRatio;
		this.viewProps.zoomStep = this.zoomStep.step;
		this.viewProps.limit = this.zoomStep.limit;
		this.viewProps.transitionTime = this.transition.time;
		this.viewProps.bgColor = this.bgColor;
		this.viewProps.elasticZoom = this.elasticZoom;
		this.viewProps.clickToZoom = this.clickToZoom;
		this.iconEffectObj = new s7sdk.IconEffect(this,
				this.iconEffect.enabled, this.iconEffect.count,
				this.iconEffect.fade, this.iconEffect.autoHide);
		this.inSpinDrag = false;
		this.direction = s7sdk.Enum.SPIN_DIRECTION.WEST;
		this.previousDirection = this.direction;
		this.directionRadians = Math.PI;
		this.displayElement = s7sdk.View.createDisplay();
		this.displayElement.width = this.wid * this.devicePixelRatio;
		this.displayElement.height = this.hei * this.devicePixelRatio;
		this.displayElement.style.width = this.wid + "px";
		this.displayElement.style.height = this.hei + "px";
		this.obj.appendChild(this.displayElement);
		if (this.uiContainer.firstChild) {
			this.uiContainer
					.insertBefore(this.obj, this.uiContainer.firstChild)
		} else {
			this.uiContainer.appendChild(this.obj)
		}
		this.displayElement.onselectstart = function() {
			return false
		};
		this.spinFrameStepTime = 0;
		this.spinFrameTimeStamp = 0;
		this.autoSpinTimer = null;
		var b = this;
		this.setupInputController();
		this.iconEffectVisibility = {
			show : function() {
				b.iconEffectVisible = true;
				b.checkIconEffect()
			},
			hide : function() {
				b.iconEffectVisible = false;
				b.checkIconEffect()
			}
		};
		if (this.spinSet.length > 0) {
			this.loadAsset(this.spinSet)
		}
	};
	s7sdk.Class.inherits("s7sdk.set.SpinView", "s7sdk.UIComponent");
	s7sdk.set.SpinView.prototype.modifiers = {
		serverUrl : {
			params : [ "isRootPath" ],
			defaults : [ "/is/image/" ]
		},
		asset : {
			params : [ "asset" ],
			defaults : [ "" ],
			parseParams : false
		},
		iscommand : {
			params : [ "value" ],
			defaults : [ "" ],
			parseParams : false
		},
		zoomStep : {
			params : [ "step", "limit" ],
			defaults : [ 1, 1 ]
		},
		transition : {
			params : [ "time", "easing" ],
			defaults : [ 0.5, 0 ],
			deprecated : true
		},
		singleclick : {
			params : [ "singleclick" ],
			defaults : [ "none" ],
			ranges : [ [ "none", "zoom", "reset", "zoomReset" ] ]
		},
		doubleclick : {
			params : [ "doubleclick" ],
			defaults : [ "zoomReset" ],
			ranges : [ [ "none", "zoom", "reset", "zoomReset" ] ]
		},
		maxLoadRadius : {
			params : [ "radius" ],
			defaults : [ 6 ]
		},
		enableHD : {
			params : [ "enable", "maxHdPixels" ],
			defaults : [ "limit", 1500 ],
			ranges : [ [ "always", "never", "limit" ] ]
		},
		iconEffect : {
			params : [ "enabled", "count", "fade", "autoHide" ],
			defaults : [ true, 1, 0.3, 3 ],
			ranges : [ , "-1:", "0:", "0:" ]
		},
		stagesize : {
			params : [ "width", "height" ],
			defaults : [ 0, 0 ],
			ranges : [ "0:", "0:" ],
			deprecated : true
		},
		size : {
			params : [ "width", "height" ],
			defaults : [ 0, 0 ],
			ranges : [ "0:", "0:" ],
			deprecated : true
		},
		modifier : {
			params : [ "modifier" ],
			defaults : [ "" ],
			deprecated : true
		},
		elasticZoom : {
			params : [ "elasticzoom" ],
			defaults : [ 0 ],
			ranges : [ "0.0:1.0" ],
			deprecated : true
		},
		fmt : {
			params : [ "fmt" ],
			defaults : [ "jpg" ],
			ranges : [ [ "jpg", "jpeg", "png", "png-alpha", "gif", "gif-alpha" ] ]
		},
		highResTileLimit : {
			params : [ "highResTileLimit" ],
			defaults : [ -1 ],
			deprecated : true
		}
	};
	s7sdk.set.SpinView.prototype.dispose = function() {
		if (this.enterFrameTimer) {
			clearInterval(this.enterFrameTimer);
			this.enterFrameTimer = null
		}
		for ( var a = 0; a < this.spinSetFrames.length; a++) {
			this.spinSetFrames[a].unload(8)
		}
	};
	s7sdk.set.SpinView.prototype.getCurrentView = function() {
		return this.currentFrame && this.currentFrame.view
	};
	s7sdk.set.SpinView.prototype.setupInputController = function() {
		var b = this;
		this.handler = new s7sdk.InputController(this.displayElement);
		this.handler.singleTapCallback = function(d, c, e) {
			b.doTapAction(c, e, d.shiftKey, false);
			s7sdk.Event.dispatch(b.obj, s7sdk.Event.CLICK, false)
		};
		this.handler.doubleTapCallback = function(d, c, e) {
			b.doTapAction(c, e, d.shiftKey, true)
		};
		this.handler.startTouchCallback = function(d, c, e) {
			b.mouseDown(c, e)
		};
		this.handler.endTouchCallback = function(d, c, e) {
			b.mouseUp(c, e, new Date().getTime())
		};
		this.handler.swipeCallback = function(d) {
			var c = b.getCurrentView();
			if (c) {
				if (!(c.state & 4)) {
				} else {
					c.inPinch = false;
					c.inPan = false;
					c.doPan(0, 0, false);
					b.invalidate();
					var e = new s7sdk.event.UserEvent(
							s7sdk.event.UserEvent.PAN, [], true);
					s7sdk.Event.dispatch(b.obj, e, false)
				}
			}
		};
		this.handler.dragCallback = function(g, c, h, f, e) {
			var d = b.getCurrentView();
			if (d) {
				if ((d.state & 4)) {
					d.inPan = true;
					d.doPan(f, e, true)
				} else {
					b.mouseMove(c, h, new Date().getTime())
				}
			}
		};
		this.handler.endDragCallback = function(g, c, i, f, e) {
			var d = b.getCurrentView();
			if (d) {
				d.inPinch = false;
				d.inPan = false;
				d.doPan(0, 0, false);
				b.invalidate();
				var h = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.PAN,
						[], true);
				s7sdk.Event.dispatch(b.obj, h, false)
			}
		};
		this.handler.pinchCallback = function(e, c, g, f) {
			var d = b.getCurrentView();
			if (d) {
				c -= s7sdk.Util.getObjPos(b.obj).x;
				g -= s7sdk.Util.getObjPos(b.obj).y;
				d.inPinch = true;
				d.pinchZoom(c, g, f, d.viewToImage)
			}
		};
		this.handler.endPinchCallback = function(e, c, g, f) {
			var d = b.getCurrentView();
			if (d) {
				d.inPinch = false;
				d.inPan = false;
				d.invalidate(false);
				b.invalidate()
			}
		};
		if (s7sdk.browser.name === "ie" && s7sdk.browser.version.minor <= 8) {
			var a = b.handler;
			this.handlerOverlay = new s7sdk.InputController(this.iconEffectObj);
			this.handlerOverlay.singleTapCallback = function(d, c, e) {
				a.singleTapCallback(d, c, e)
			};
			this.handlerOverlay.doubleTapCallback = function(d, c, e) {
				a.doubleTapCallback(d, c, e)
			};
			this.handlerOverlay.startTouchCallback = function(d, c, e) {
				a.startTouchCallback(d, c, e)
			};
			this.handlerOverlay.endTouchCallback = function(d, c, e) {
				a.endTouchCallback(d, c, e)
			};
			this.handlerOverlay.swipeCallback = function(c) {
				a.swipeCallback(c)
			};
			this.handlerOverlay.dragCallback = function(f, c, g, e, d) {
				a.dragCallback(f, c, g)
			};
			this.handlerOverlay.endDragCallback = function(f, c, g, e, d) {
				a.endDragCallback(f, c, g)
			};
			this.handlerOverlay.pinchCallback = function(d, c, f, e) {
				a.pinchCallback(d, c, f)
			};
			this.handlerOverlay.endPinchCallback = function(d, c, f, e) {
				a.endPinchCallback(d, c, f)
			}
		}
	};
	s7sdk.set.SpinView.prototype.doTapAction = function(a, g, d, f) {
		var c = this.getCurrentView();
		if (c) {
			var b = f ? s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_ZOOM
					: s7sdk.Enum.CLICK_STATE.CLICK_TO_ZOOM;
			var e = f ? s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_RESET
					: s7sdk.Enum.CLICK_STATE.CLICK_TO_RESET;
			a -= s7sdk.Util.getObjPos(this.obj).x;
			g -= s7sdk.Util.getObjPos(this.obj).y;
			if (this.clickToZoom & b) {
				if (this.clickToZoom & e && !(c.state & 1)) {
					c.zoomReset()
				} else {
					c.zoomClick(a, g, d)
				}
			} else {
				if (this.clickToZoom & e) {
					c.zoomReset()
				}
			}
		}
	};
	s7sdk.set.SpinView.prototype.addEventListener = function(c, b, a) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.set.SpinView.addEventListener - type: %0, handler: %1, useCapture: %2",
						c,
						b.toString().substring(0, b.toString().indexOf("(")), a);
		s7sdk.Base.prototype.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.set.SpinView.prototype.loadRequest = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINER,
				"s7sdk.set.SpinView.loadRequest - response: %0", a);
		this.createMediaSet2D(s7sdk.MediaSetParser.parse(a.set,
				this.imageModifier));
		var c;
		for ( var b = 0; b < this.spinSetFrames.length; b++) {
			c = this.spinSetFrames[b];
			c.dragToPan = !this.dragToSpin
		}
		this.settings.trackLoad(this)
	};
	s7sdk.set.SpinView.prototype.errorRequest = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.WARNING,
				"s7sdk.set.SpinView.errorRequest - response: %0", a)
	};
	s7sdk.set.SpinView.prototype.setMediaSet = function(c) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.setMediaSet - mediaSet: %0", c);
		this.spinSet = c.name;
		if (c.hasOwnProperty("items")) {
			this.createMediaSet2D(c)
		} else {
			this.loadAsset(c);
			return
		}
		var b;
		for ( var a = 0; a < this.spinSetFrames.length; a++) {
			b = this.spinSetFrames[a];
			b.dragToPan = !this.dragToSpin
		}
		this.settings.trackLoad(this)
	};
	s7sdk.set.SpinView.prototype.setAsset = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.setAsset - asset: %0", b);
		var a = this.spinSet;
		this.spinSetArray = [];
		this.spinSetFrames = [];
		this.spinSetItems = [];
		this.loadAsset(b);
		if (a != this.spinSet && a != null && a != "") {
			var c = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.SWAP, [ 0,
					this.spinSet ], true);
			s7sdk.Event.dispatch(this.obj, c, false)
		}
	};
	s7sdk.set.SpinView.prototype.loadAsset = function(a) {
		this.spinSet = a;
		var c = s7sdk.MediaSetParser.parseAssetForSetReq(this.spinSet);
		var b = this.serverUrl + "/" + c.name;
		b += "?" + c.req;
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			b += "&locale=" + this.locale
		}
		this.isReq = new s7sdk.IS(this.serverUrl, this.spinSet);
		this.isReq.getHttpReq(b, function(e, d) {
			s7sdk.set.SpinView.prototype.loadRequest.apply(d, [ e ])
		}, function(e, d) {
			s7sdk.set.SpinView.prototype.errorRequest.apply(d, [ e ])
		}, this)
	};
	s7sdk.set.SpinView.prototype.draw = function() {
		if (this.currentFrame != null && this.currentFrame.view != null) {
			this.currentFrame.view.draw()
		}
	};
	s7sdk.set.SpinView.prototype.resize = function(a, d) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.resize - w: %0, h: %1", a, d);
		if (a == this.wid && d == this.hei) {
			return
		}
		this.wid = a > 0 ? a : 1;
		this.hei = d > 0 ? d : 1;
		this.devicePixelRatio = s7sdk.Util.adjustDevicePixelRatio(
				this.enableHD.maxHdPixels, this.hei, this.wid);
		this.viewProps.outWidth = this.wid * this.devicePixelRatio;
		this.viewProps.outHeight = this.hei * this.devicePixelRatio;
		this.displayElement.width = this.viewProps.outWidth;
		this.displayElement.height = this.viewProps.outHeight;
		this.displayElement.style.width = this.wid + "px";
		this.displayElement.style.height = this.hei + "px";
		var e = false;
		if (this.currentFrame != null) {
			this.currentFrame.resize();
			e = !Boolean(this.currentFrame.view.state & 4)
		}
		var c;
		for ( var b = 0; b < this.spinSetFrames.length; b++) {
			c = this.spinSetFrames[b];
			if (c != this.currentFrame) {
				c.resize()
			}
			if (e && c.view != null) {
				c.view.zoomReset()
			}
		}
		if (this.iconEffectObj.enabled) {
			this.iconEffectObj.centerOverlay(a, d)
		}
		this.dispatchEvent(new s7sdk.event.ResizeEvent(
				s7sdk.event.ResizeEvent.COMPONENT_RESIZE, a, d, false));
		s7sdk.UIComponent.prototype.resize.apply(this, [ a, d ])
	};
	s7sdk.set.SpinView.prototype.getFrameDist = function() {
		if (this.maxFramesPerRow == 0) {
			return 0
		}
		var a = 360 / this.maxFramesPerRow;
		return (this.wid * a) / (360 * 2)
	};
	s7sdk.set.SpinView.prototype.getFrameDistY = function() {
		var a = 360 / this.spinSetDesc.items.length;
		return (this.hei * a) / (360 * 2)
	};
	s7sdk.set.SpinView.prototype.setDragToSpin = function(a) {
		if (a == this.dragToSpin) {
			return
		}
		this.updateDragToSpin(a)
	};
	s7sdk.set.SpinView.prototype.updateDragToSpin = function(c) {
		this.dragToSpin = c;
		var b;
		for ( var a = 0; a < this.spinSetFrames.length; a++) {
			b = this.spinSetFrames[a];
			b.dragToPan = !this.dragToSpin
		}
		this.checkCursor();
		if (this.spinSetFrames.length > 0) {
			this.stateChangeNotify()
		}
	};
	s7sdk.set.SpinView.prototype.getPanSpinMode = function() {
		return this.panSpinMode
	};
	s7sdk.set.SpinView.prototype.setPanSpinMode = function(a) {
		this.panSpinMode = a;
		if (this.panSpinMode) {
			this.applyPanSpin()
		}
	};
	s7sdk.set.SpinView.prototype.applyPanSpin = function() {
		if (this.currentFrame) {
			this.dragToSpin = !Boolean(this.viewState & 4)
		} else {
			this.dragToSpin = true
		}
	};
	s7sdk.set.SpinView.prototype.getFrameCount = function(a) {
		var d = 0;
		var b = this.getFrameDist();
		var c = Math.abs(a.currentX - this.lastX);
		if (c > b && b > 0) {
			d = Math.floor(c / b)
		}
		return d
	};
	s7sdk.set.SpinView.prototype.getFrameSet = function(c, b) {
		var h, g, f, j, i, a, e, d = [];
		h = (c - this.lastX) / this.getFrameDist();
		g = this.spinSet2D ? (b - this.lastY) / this.getFrameDistY() : 0;
		e = k(this.currentFrame.position.x, this.currentFrame.position.y, Math
				.round(this.currentFrame.position.x - h), Math
				.round(this.currentFrame.position.y - g));
		for (j = 0; j < e.length; j++) {
			f = e[j];
			if (f.x == this.currentFrame.position.x
					&& f.y == this.currentFrame.position.y) {
				continue
			}
			f = this.wrapPoint(f);
			for (i = 0; i < this.spinSetFrames.length; i++) {
				a = this.spinSetFrames[i];
				if (a.position.x == f.x && a.position.y == f.y) {
					d.push(i);
					break
				}
			}
		}
		return d;
		function k(m, t, l, s) {
			var w = Math.abs(l - m), v = Math.abs(s - t), r = (m < l) ? 1 : -1, q = (t < s) ? 1
					: -1, n = w - v, u = [];
			var o = 200;
			while (true) {
				u.push(new s7sdk.Point2D(m, t));
				if ((m == l) && (t == s)) {
					break
				}
				var p = 2 * n;
				if (p > -v) {
					n -= v;
					m += r
				}
				if (p < w) {
					n += w;
					t += q
				}
				if (o-- < 0) {
					break
				}
			}
			return u
		}
	};
	s7sdk.set.SpinView.prototype.wrapPoint = function(f, c) {
		var e, d, a, b;
		if (this.spinSet2D) {
			e = this.spinSetDesc.items;
			if (f.y < 0 || f.y >= e.length) {
				if (this.wrapVertical) {
					f.y = ((f.y % e.length) + e.length) % e.length
				} else {
					f.y = f.y < 0 ? 0 : e.length - 1
				}
			}
			d = e[f.y];
			b = Math.round((this.maxFramesPerRow - d.items.length) / 2);
			if (f.x < b || f.x >= (d.items.length + b)) {
				if (c == s7sdk.Enum.SPIN_DIRECTION.NORTH
						|| c == s7sdk.Enum.SPIN_DIRECTION.SOUTH) {
					f.x = (f.x > b) ? (d.items.length + b - 1) : b
				} else {
					a = d.items.length;
					f.x -= b;
					f.x = ((f.x % a) + a) % a;
					f.x += b
				}
			}
		} else {
			a = this.spinSetDesc.items.length;
			f.x = f.x = ((f.x % a) + a) % a
		}
		return f
	};
	s7sdk.set.SpinView.prototype.mouseDown = function(a, b) {
		s7sdk.Logger.log(s7sdk.Logger.FINEST,
				"s7sdk.set.SpinView.mouseDown - x: %0, y: %1", a, b);
		if (this.autoSpinTimer != null) {
			clearTimeout(this.autoSpinTimer);
			this.autoSpinTimer = null;
			this.stopSpin()
		}
		this.mouseIsDown = true;
		this.lastX = a;
		this.lastY = b;
		this.startFramePos = new s7sdk.Point2D(this.currentFrame.position.x,
				this.currentFrame.position.y);
		if (this.spinSet2D) {
			this.startFramePos.x += Math
					.round((this.maxFramesPerRow - this.spinSetDesc.items[this.currentFrame.position.y].items.length) / 2)
		}
		this.lastFramePos = this.startFramePos;
		return false
	};
	s7sdk.set.SpinView.prototype.mouseMove = function(i, d, a) {
		var e, b, c, h, f, k, g, j;
		if (this.currentFrame.view && this.currentFrame.view.inTransition) {
			this.currentFrame.view.stopTransition()
		}
		if (this.dragToSpin && this.mouseIsDown) {
			if (i == this.lastX && d == this.lastY) {
				return false
			}
			this.setSpinDirection(i, d, this.lastX, this.lastY);
			h = i - this.lastX;
			f = this.spinSet2D ? (d - this.lastY) : 0;
			h *= 3;
			f *= 1.5;
			k = Math.round(h * this.maxFramesPerRow / this.wid);
			g = Math.round(f * this.spinSetDesc.items.length / this.hei);
			e = new s7sdk.Point2D(this.lastFramePos.x - k, this.lastFramePos.y
					- g);
			e = this.wrapPoint(e, this.direction);
			c = this.spinSet2D ? Math
					.round((this.maxFramesPerRow - this.spinSetDesc.items[e.y].items.length) / 2)
					: 0;
			if ((this.currentFrame.position.x + c) == e.x
					&& this.currentFrame.position.y == e.y) {
				return false
			}
			for (j = 0; j < this.spinSetFrames.length; j++) {
				b = this.spinSetFrames[j];
				if ((b.position.x + c) == e.x && b.position.y == e.y) {
					break
				}
			}
			this.frame = parseInt(j);
			this.lastFramePos = new s7sdk.Point2D(b.position.x, b.position.y);
			if (this.spinSet2D) {
				this.lastFramePos.x += Math
						.round((this.maxFramesPerRow - this.spinSetDesc.items[b.position.y].items.length) / 2)
			}
			this.lastX = i;
			this.lastY = d;
			this.nextFrame = b;
			this.nextFrame.setPriority(s7sdk.SpinFrame.MAX_PRIORITY);
			this.nextFrame.setTileRender(false);
			this.nextFrame.setDelayTileLoad(true);
			this.nextFrame.loadFrame();
			this.nextFrame.invalidate();
			if (this.nextFrame.view == null) {
				if (this.currentFrame != null) {
					this.currentFrame.view.writeOverlay("Please Wait ...");
					this.currentFrame.invalidate()
				}
				this.nextFrame.image.parentView = this;
				s7sdk.Event.addDOMListener(this.nextFrame.image,
						s7sdk.Event.VIEW_LOADED,
						s7sdk.set.SpinView.onFrameLoaded, false);
				this.paused = true
			} else {
				this.replaceFrame()
			}
			this.spinFrameTimeStamp = a;
			this.inSpinDrag = true;
			if (this.previousDirection == this.direction) {
				var l = (a - this.spinFrameTimeStamp) / this.maxFramesPerRow;
				this.spinFrameStepTime = l * 0.8 + this.spinFrameStepTime * 0.2
			} else {
				this.spinFrameStepTime = 0
			}
			return true
		}
		return false
	};
	s7sdk.set.SpinView.prototype.gridCoordsToFrameIndex = function(b) {
		var a = 0, c, d;
		if (this.spinSet2D) {
			for (d = 0; d < this.spinSetDesc.items.length && d < b.y; d++) {
				a += this.spinSetDesc.items[d].items.length
			}
			c = this.spinSet2D ? Math
					.round((this.maxFramesPerRow - this.spinSetDesc.items[b.y].items.length) / 2)
					: 0;
			if (b.x >= c && b.x < this.maxFramesPerRow - c) {
				a += b.x - c
			} else {
				a = NaN
			}
		} else {
			a = b.x
		}
		return a
	};
	s7sdk.set.SpinView.prototype.setSpinDirection = function(f, e, d, c) {
		var k, j, g;
		this.previousDirection = this.direction;
		k = f - d;
		if (!this.spinSet2D) {
			if (k < 0) {
				this.direction = s7sdk.Enum.SPIN_DIRECTION.WEST;
				this.directionRadians = Math.PI
			} else {
				this.direction = s7sdk.Enum.SPIN_DIRECTION.EAST;
				this.directionRadians = 0
			}
			return
		}
		j = e - c;
		g = Math.sqrt(k * k + j * j);
		var i = Math.asin(j / g);
		var a = Math.acos(k / g);
		var h = 360 * i / (2 * Math.PI);
		var b = 360 * a / (2 * Math.PI);
		if (j < 0) {
			this.directionRadians = a
		} else {
			this.directionRadians = 2 * Math.PI - a
		}
		if (h > 67.5) {
			this.direction = s7sdk.Enum.SPIN_DIRECTION.SOUTH
		} else {
			if (h < -67.5) {
				this.direction = s7sdk.Enum.SPIN_DIRECTION.NORTH
			} else {
				if (b > 152.5) {
					this.direction = s7sdk.Enum.SPIN_DIRECTION.WEST
				} else {
					if (b < 22.5) {
						this.direction = s7sdk.Enum.SPIN_DIRECTION.EAST
					} else {
						if (h > 22.5) {
							if (b > 90) {
								this.direction = s7sdk.Enum.SPIN_DIRECTION.SOUTH_WEST
							} else {
								this.direction = s7sdk.Enum.SPIN_DIRECTION.SOUTH_EAST
							}
						} else {
							if (h < -22.5) {
								if (b > 90) {
									this.direction = s7sdk.Enum.SPIN_DIRECTION.NORTH_WEST
								} else {
									this.direction = s7sdk.Enum.SPIN_DIRECTION.NORTH_EAST
								}
							} else {
								s7sdk.Logger.log(s7sdk.Logger.FINER,
										"s7sdk.set.SpinView - error determining spin direction for "
												+ k + ", " + j + ", " + g)
							}
						}
					}
				}
			}
		}
	};
	s7sdk.set.SpinView.prototype.mouseUp = function(c, b, a) {
		this.mouseIsDown = false;
		if (this.inSpinDrag) {
			this.inSpinDrag = false;
			var h = true;
			var d = a - this.spinFrameTimeStamp;
			if (d < 30) {
				if (c != this.lastX || b != this.lastY) {
					this.setSpinDirection(c, b, this.lastX, this.lastY);
					this.lastX = c;
					this.lastY = b
				}
				if (this.previousDirection == this.direction) {
					this.stopSpin();
					var g = (d) / this.maxFramesPerRow;
					this.spinFrameStepTime = g * 0.8 + this.spinFrameStepTime
							* 0.2
				} else {
					this.spinFrameStepTime = 0;
					h = false
				}
			} else {
				h = false
			}
			s7sdk.Logger.log(s7sdk.Logger.FINEST,
					"s7sdk.set.SpinView.mouseUp - spinFrameStepTime: %0",
					this.spinFrameStepTime);
			if (this.spinFrameStepTime < 200 && h) {
				this.spinFrameStepTime = (this.spinFrameStepTime > 30) ? this.spinFrameStepTime
						: 30;
				this.stopSpin();
				this.flickTtl = 2000;
				if (this.spinSet2D && this.spinSetIsRect) {
					var i, f;
					i = this.lastX + 3000 * Math.cos(this.directionRadians);
					f = this.lastY - 3000 * Math.sin(this.directionRadians);
					this.flickSet = this.getFrameSet(i, f)
				}
				var e = this;
				this.autoSpinTimer = setTimeout(function() {
					s7sdk.set.SpinView.prototype.flickSpinStep.call(e)
				}, 30)
			} else {
				this.stopSpin();
				this.invalidate()
			}
			return true
		} else {
			if (this.autoSpinTimer != null) {
				return true
			}
		}
		return false
	};
	s7sdk.set.SpinView.prototype.flickSpinStep = function() {
		if (this.flickTtl <= 0 || this.autoSpinTimer == null
				|| (this.flickSet && this.flickSet.length < 1)) {
			this.autoSpinTimer = null;
			return
		}
		this.spinFrameStepTime *= 1.1;
		this.flickTtl -= this.spinFrameStepTime + 5;
		if (this.spinSet2D && this.spinSetIsRect) {
			if (this.flickSet && this.flickSet.length > 0) {
				this.frameQueue.push(this.flickSet.shift())
			}
		} else {
			this.moveFrame(this.direction)
		}
		var a = this;
		this.autoSpinTimer = setTimeout(function() {
			s7sdk.set.SpinView.prototype.flickSpinStep.call(a)
		}, this.spinFrameStepTime)
	};
	s7sdk.set.SpinView.prototype.stopSpin = function() {
		if (this.paused) {
			this.currentFrame.view.writeOverlay(null);
			s7sdk.Event.removeDOMListener(this.nextFrame.image,
					s7sdk.Event.VIEW_LOADED, s7sdk.set.SpinView.onFrameLoaded,
					false);
			this.paused = false
		}
		while (this.frameQueue.length > 0) {
			var a = this.spinSetFrames[this.frameQueue.shift()];
			if (a && a.image) {
				s7sdk.Event.removeDOMListener(a.image, s7sdk.Event.VIEW_LOADED,
						s7sdk.set.SpinView.onFrameLoaded, false)
			}
		}
	};
	s7sdk.set.SpinView.deferClickHandler = function(b, a) {
		a.doubleClickTestTimer = null;
		if (a.view.clickToZoom & s7sdk.Enum.CLICK_STATE.CLICK_TO_ZOOM) {
			a.view.currentFrame.view
					.zoomClick(b.clientX, b.clientY, b.shiftKey)
		} else {
			if (a.view.clickToZoom & s7sdk.Enum.CLICK_STATE.CLICK_TO_RESET) {
				a.view.currentFrame.view.zoomReset()
			}
		}
	};
	s7sdk.set.SpinView.prototype.invalidate = function() {
		if (this.currentFrame != null && this.frameInvalidated == false) {
			this.currentFrame.setTileRender(true);
			this.currentFrame.setDelayTileLoad(false);
			this.currentFrame.invalidate();
			this.frameInvalidated = true;
			var a = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.SPIN,
					[ this.currentFrame.idx ], true);
			s7sdk.Event.dispatch(this.obj, a, false);
			this.stateChangeNotify()
		}
	};
	s7sdk.set.SpinView.prototype.enterFrame = function() {
		if (this.paused == false && this.frameQueue.length > 0) {
			this.loadFrames()
		}
		if (this.mouseIsDown == false && this.frameQueue.length == 0
				&& this.t == 0) {
			this.invalidate()
		}
	};
	s7sdk.set.SpinView.prototype.onEnterFrame = function(c) {
		var b = s7sdk.Event.getTarget(c).s7gesture;
		var a = b.view.getDisplayElement().s7spinView;
		if (!a) {
			return
		}
		a.enterFrame()
	};
	s7sdk.set.SpinView.prototype.moveFrame = function(d) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.moveFrame - direction: %0", d);
		var c, e, a, b;
		this.zoomReset();
		if (this.direction != d) {
			this.stopSpin()
		}
		e = new s7sdk.Point2D(0, 0);
		if (this.spinSetFrames.length >= 1) {
			e.x = this.spinSetFrames[this.frameIdx(this.frame)].position.x;
			e.y = this.spinSetFrames[this.frameIdx(this.frame)].position.y;
			e.x += this.spinSet2D ? Math
					.round((this.maxFramesPerRow - this.spinSetDesc.items[e.y].items.length) / 2)
					: 0
		}
		this.direction = d;
		switch (d) {
		case s7sdk.Enum.SPIN_DIRECTION.EAST:
			e.x -= 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.WEST:
			e.x += 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.NORTH:
			e.y += 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.SOUTH:
			e.y -= 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.NORTH_WEST:
			e.y += 1;
			e.x += 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.NORTH_EAST:
			e.y += 1;
			e.x -= 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.SOUTH_WEST:
			e.y -= 1;
			e.x += 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.SOUTH_EAST:
			e.y -= 1;
			e.x -= 1;
			break;
		default:
			return
		}
		if (e.y < 0 || e.y >= this.spinSetDesc.items.length) {
			e.y = e.y < 0 ? 0 : this.spinSetDesc.items.length - 1
		}
		b = this.spinSet2D ? Math
				.round((this.maxFramesPerRow - this.spinSetDesc.items[e.y].items.length) / 2)
				: 0;
		e = this.wrapPoint(e);
		this.adjustSpeed();
		for (a = 0; a < this.spinSetFrames.length; a++) {
			c = this.spinSetFrames[a];
			if ((c.position.x + b) == e.x && c.position.y == e.y) {
				this.frame = parseInt(a);
				this.frameQueue.push(parseInt(a));
				break
			}
		}
	};
	s7sdk.set.SpinView.prototype.adjustSpeed = function() {
		this.t += 2;
		if (this.idleSpeed == -1) {
			this.idleSpeed = setInterval(s7sdk.Util.wrapContext(
					this.checkSpeed, this), 500)
		}
	};
	s7sdk.set.SpinView.prototype.checkSpeed = function() {
		if (this.t == 0) {
			this.frameSpeed = 1;
			clearInterval(this.idleSpeed);
			this.idleSpeed = -1
		} else {
			this.frameSpeed = this.smoothFactor * this.t
					+ (1 - this.smoothFactor) * this.frameSpeed
		}
		this.t = 0
	};
	s7sdk.set.SpinView.prototype.idleLoad = function() {
		var b = this.spinSet2D ? Math
				.round((this.maxFramesPerRow - this.spinSetDesc.items[this.currentFrame.position.y].items.length) / 2)
				: 0;
		var e = 5 - this.frameLoader.loading;
		var a = 0;
		var d = 0;
		for (; a < e && d < this.maxRadius; d++) {
			s7sdk.SpinViewUtil.filledCircle(this.currentFrame.position.x + b,
					this.currentFrame.position.y, d, s7sdk.SpinViewUtil
							.uniquePixelSetter(s7sdk.Util.wrapContext(
									function(h, j) {
										if (a >= e) {
											return
										}
										var g = this
												.wrapPoint(new s7sdk.Point2D(h,
														j));
										var f = this.gridCoordsToFrameIndex(g);
										if (!isNaN(f)) {
											var i = this.spinSetFrames[f];
											if (i && !i.loaded) {
												i.setPriority(Math.max(50 - d,
														1));
												this.frameLoader.load(i);
												a++
											}
										}
									}, this)))
		}
		if (this.maxRadius <= this.maxFramesPerRow / 2
				&& (this.maxRadius < this.maxLoadRadius || this.maxLoadRadius == -1)) {
			this.maxRadius++
		}
		if (this.maxLoadRadius != -1) {
			return
		}
		for (d = 0; a < e && d < this.spinSetFrames.length; d++) {
			frame = this.spinSetFrames[d];
			if (frame && !frame.loaded) {
				frame.setPriority(30);
				this.frameLoader.load(frame);
				a++
			}
		}
		if (a == 0) {
			var c = true;
			for (d = 0; d < this.spinSetFrames.length; d++) {
				if (this.spinSetFrames[d].view == null
						|| this.spinSetFrames[d].view.resetImageLoaded == false) {
					c = false;
					break
				}
			}
			if (c) {
				window.clearInterval(this.idleLoadTimer)
			}
		}
		return
	};
	s7sdk.set.SpinView.prototype.createMediaSet = function(b) {
		var e;
		var c = 0;
		this.spinSetArray = [];
		this.spinSetFrames = [];
		this.spinSetItems = [];
		if (this.idleLoadTimer) {
			clearInterval(this.idleLoadTimer);
			this.idleLoadTimer = null
		}
		if (this.enterFrameTimer) {
			clearInterval(this.enterFrameTimer);
			this.enterFrameTimer = null
		}
		this.spinSetItems = b.items;
		while (this.spinSetItems.hasOwnProperty("length")
				&& this.spinSetItems.length > 0
				&& this.spinSetItems[0] != undefined
				&& this.spinSetItems[0].hasOwnProperty("items")
				&& this.spinSetItems[0].items.length > 0) {
			this.spinSetItems = this.spinSetItems[0].items
		}
		for ( var a = 0; a < this.spinSetItems.length; a++) {
			if (typeof (this.spinSetItems[a]) == "undefined") {
				s7sdk.Logger
						.log(
								s7sdk.Logger.WARNING,
								"s7sdk.set.SpinView - Malformed data in MediaSetDesc: %0",
								b.name);
				continue
			}
			e = this.spinSetItems[a].name || "";
			e = e.trim();
			this.spinSetArray.push(e);
			function d(g, f, h) {
				g += ((g.indexOf("?") == -1) ? "?" : "&") + f;
				g += (typeof h == "undefined") ? "" : "=" + h;
				return g
			}
			if (this.iscommand != null && this.iscommand.length > 0) {
				e = d(e, this.iscommand)
			}
			if (s7sdk.Util.isNonEmptyString(this.locale)) {
				e = d(e, "locale", this.locale)
			}
			if (s7sdk.Util.isNonEmptyString(this.spinSetItems[a].version)) {
				e = d(e, "id", this.spinSetItems[a].version)
			}
			this.spinSetFrames[c] = new s7sdk.SpinFrame(this, this.serverUrl,
					e, c++, this.viewProps, this.spinSetItems[a].width,
					this.spinSetItems[a].height);
			this.spinSetFrames[c].position = new s7sdk.Point2D(c, 0)
		}
		this.frame = -1;
		this.moveFrame(s7sdk.Enum.SPIN_DIRECTION.WEST);
		this.idleLoadTimer = setInterval(s7sdk.Util.wrapContext(this.idleLoad,
				this), 100);
		this.enterFrameTimer = setInterval(s7sdk.Util.wrapContext(
				this.enterFrame, this), 1000 / 24)
	};
	s7sdk.set.SpinView.prototype.isMediaSet2D = function(a) {
		return a.items.hasOwnProperty("length") && a.items.length > 0
				&& a.items[0] != undefined
				&& a.items[0].hasOwnProperty("items")
				&& a.items[0].items.length > 0
	};
	s7sdk.set.SpinView.prototype.createMediaSet2D = function(h) {
		var k = this, f, j, e, b, c, g = 0, d = 0;
		this.spinSetArray = [];
		this.spinSetFrames = [];
		this.spinSetItems = [];
		this.maxFramesPerRow = 0;
		if (this.idleLoadTimer) {
			clearInterval(this.idleLoadTimer);
			this.idleLoadTimer = null
		}
		if (this.enterFrameTimer) {
			clearInterval(this.enterFrameTimer);
			this.enterFrameTimer = null
		}
		if (this.autoSpinTimer != null) {
			clearTimeout(this.autoSpinTimer);
			this.autoSpinTimer = null;
			this.stopSpin()
		}
		this.spinSet2D = this.isMediaSet2D(h);
		s7sdk.Util.css.setCSSAttributeSelector(this.iconEffectObj.obj, "state",
				this.spinSet2D ? "spin_2D" : "spin_1D");
		this.spinSetIsRect = true;
		this.spinSetDesc = h;
		if (this.spinSet2D) {
			for (j = 0; j < this.spinSetDesc.items.length; j++) {
				e = this.spinSetDesc.items[j];
				c = 0;
				for (f = 0; e.items && f < e.items.length; f++) {
					if (typeof (e.items[f]) == "undefined") {
						s7sdk.Logger
								.log(
										s7sdk.Logger.WARNING,
										"s7sdk.set.SpinView - Malformed data in MediaSetDesc: %0",
										h.name);
						continue
					}
					this.spinSetFrames[d] = a(e.items[f]);
					c += 1
				}
				g += 1;
				if (c > this.maxFramesPerRow) {
					this.maxFramesPerRow = c
				}
				if (c != this.maxFramesPerRow) {
					this.spinSetIsRect = false
				}
			}
		} else {
			this.spinSetItems = h.items;
			while (this.spinSetItems.hasOwnProperty("length")
					&& this.spinSetItems.length > 0
					&& this.spinSetItems[0] != undefined
					&& this.spinSetItems[0].hasOwnProperty("items")
					&& this.spinSetItems[0].items.length > 0) {
				this.spinSetItems = this.spinSetItems[0].items
			}
			c = 0;
			for (j = 0; j < this.spinSetDesc.items.length; j++) {
				if (typeof (this.spinSetDesc.items[j]) == "undefined") {
					continue
				}
				this.spinSetFrames[d] = a(this.spinSetDesc.items[j]);
				c += 1;
				this.maxFramesPerRow = c
			}
		}
		this.maxLoadRadius = (this.maxLoadRadius > this.maxFramesPerRow / 2) ? Math
				.ceil(this.maxFramesPerRow / 2)
				: this.maxLoadRadius;
		this.maxRadius = this.maxLoadRadius > 0 ? this.maxLoadRadius : 1;
		this.frame = 0;
		this.frameQueue.push(0);
		this.idleLoadTimer = setInterval(s7sdk.Util.wrapContext(this.idleLoad,
				this), 100);
		this.enterFrameTimer = setInterval(s7sdk.Util.wrapContext(
				this.enterFrame, this), 1000 / 24);
		function a(i) {
			b = i.name || "";
			b = b.trim();
			function m(o, n, p) {
				o += ((o.indexOf("?") == -1) ? "?" : "&") + n;
				o += (typeof p == "undefined") ? "" : "=" + p;
				return o
			}
			if (k.iscommand != null && k.iscommand.length > 0) {
				b = m(b, k.iscommand)
			}
			if (s7sdk.Util.isNonEmptyString(k.locale)) {
				b = m(b, "locale", k.locale)
			}
			if (s7sdk.Util.isNonEmptyString(i.version)) {
				b = m(b, "id", i.version)
			}
			var l = new s7sdk.SpinFrame(k, k.serverUrl, b, d++, k.viewProps,
					i.width, i.height);
			l.position = new s7sdk.Point2D(c, g);
			k.spinSetArray.push(b);
			return l
		}
	};
	s7sdk.set.SpinView.prototype.ioErrorHandler = function(a) {
		Logger.log(Logger.SEVERE,
				"SpinViewCC.ioErrorHandler Invalid image set response: %0", a);
		this.visible = false;
		this.dispatchEvent(a)
	};
	s7sdk.set.SpinView.prototype.frameIdx = function(a) {
		return ((a % this.spinSetFrames.length) + this.spinSetFrames.length)
				% this.spinSetFrames.length
	};
	s7sdk.set.SpinView.prototype.loadFrames = function() {
		if (this.spinSetFrames.length == 0 || this.frameQueue.length == 0) {
			return
		}
		this.nextFrame = this.spinSetFrames[this.frameQueue.shift()];
		if (typeof (this.nextFrame) == "undefined") {
			s7sdk.Logger.log(s7sdk.Logger.WARNING,
					"s7sdk.set.SpinView - undefined frame in mediaSet: %0",
					this.mediaSet_);
			return
		}
		this.nextFrame.setPriority(s7sdk.SpinFrame.MAX_PRIORITY);
		this.nextFrame.setTileRender(false);
		this.nextFrame.setDelayTileLoad(true);
		this.nextFrame.loadFrame();
		this.nextFrame.invalidate();
		if (this.nextFrame.view == null) {
			if (this.currentFrame != null) {
				this.currentFrame.view.writeOverlay("Please Wait ...");
				this.currentFrame.invalidate()
			}
			this.nextFrame.image.parentView = this;
			s7sdk.Event.addDOMListener(this.nextFrame.image,
					s7sdk.Event.VIEW_LOADED, s7sdk.set.SpinView.onFrameLoaded,
					false);
			this.paused = true
		} else {
			this.replaceFrame()
		}
		this.scheduleFrames()
	};
	s7sdk.set.SpinView.prototype.replaceFrame = function() {
		if (this.currentFrame != null && this.currentFrame.view != null) {
			this.currentFrame.view.writeOverlay(null);
			this.currentFrame.unload(1);
			if (this.currentFrame.view.getDisplayElement() != null) {
				s7sdk.Event.removeDOMListener(this.currentFrame.view
						.getDisplayElement(), s7sdk.Event.ENTER_FRAME,
						this.onEnterFrame, false);
				this.currentFrame.view.getDisplayElement().s7spinView = null;
				this.currentFrame.view.detach()
			}
		}
		this.currentFrame = this.nextFrame;
		this.frameInvalidated = false;
		this.currentFrame.view.attach(this);
		this.currentFrame.view.getDisplayElement().s7spinView = this;
		s7sdk.Event.addDOMListener(this.currentFrame.view.getDisplayElement(),
				s7sdk.Event.ENTER_FRAME, this.onEnterFrame, false);
		this.frame = this.currentFrame.idx;
		this.checkIconEffect();
		var a;
		if (this.spinSet2D) {
			a = this.spinSetDesc.items[this.currentFrame.position.y]
		} else {
			a = this.spinSetItems[this.currentFrame.idx]
		}
		var b = new s7sdk.event.AssetEvent(
				s7sdk.event.AssetEvent.ASSET_CHANGED, a, this.currentFrame.idx,
				true);
		this.dispatchEvent(b)
	};
	s7sdk.set.SpinView.prototype.scheduleFrames = function() {
		if (this.frameQueue.length > 0) {
			return
		}
		this.nextFrame.invalidate();
		var c = (this.frameSpeed > 2) ? this.frameSpeed : 4;
		this.frameLoader.toLoad = c;
		this.frameLoader.reducePriority();
		var b;
		var e;
		var a = s7sdk.SpinFrame.MAX_PRIORITY;
		var d = 1;
		switch (this.direction) {
		case s7sdk.Enum.SPIN_DIRECTION.WEST:
			d = 1;
			break;
		case s7sdk.Enum.SPIN_DIRECTION.EAST:
			d = -1;
			break;
		default:
		}
		for (b = 0; b < c; b++) {
			e = this.spinSetFrames[this.frameIdx(this.nextFrame.idx + d * b)];
			e.setPriority(a--);
			this.frameLoader.load(e);
			if (b < 3 && this.frameSpeed < 3) {
				e.setDelayTileLoad(true);
				e.invalidate()
			}
		}
		e = this.spinSetFrames[this.frameIdx(this.nextFrame.idx - d)];
		e.setPriority(a);
		this.frameLoader.load(e)
	};
	s7sdk.set.SpinView.prototype.createWaitOverlay = function() {
	};
	s7sdk.set.SpinView.onFrameLoaded = function(b) {
		var a = s7sdk.Event.getTarget(b);
		s7sdk.Event.removeDOMListener(a, s7sdk.Event.VIEW_LOADED,
				s7sdk.set.SpinView.onFrameLoaded, false);
		a.parentView.paused = false;
		a.parentView.replaceFrame()
	};
	s7sdk.set.SpinView.prototype.getFrameSpeed = function() {
		return this.frameSpeed
	};
	s7sdk.set.SpinView.prototype.cursorOn = function() {
		if (this.overrideCursor) {
			for ( var a = 0; a < this.spinSetArray.length; a++) {
				if (this.spinSetArray[a].view) {
					a.view.overrideCursor = this
				}
			}
			this.overrideCursor = null
		}
	};
	s7sdk.set.SpinView.prototype.cursorOff = function() {
		if (!this.overrideCursor) {
			for ( var a = 0; a < this.spinSetArray.length; a++) {
				if (this.spinSetArray[a].view) {
					a.view.overrideCursor = null
				}
			}
			this.overrideCursor = this.currentFrame.view
		}
	};
	s7sdk.set.SpinView.prototype.checkCursor = function() {
		if (!Boolean(this.viewState & 4)) {
			this.cursorOn();
			this.cursor = this.dragToSpin ? "dragToSpin" : "zoomIn"
		} else {
			if (this.dragToSpin && this.mouseIsDown) {
				this.cursorOn();
				this.cursor = "dragToSpin"
			} else {
				this.cursorOff()
			}
		}
	};
	s7sdk.set.SpinView.prototype.checkIconEffect = function() {
		if (typeof this.iconEffectVisible == "undefined") {
			this.iconEffectVisible = true
		}
		if (this.iconEffectObj.enabled) {
			if (!this.iconEffectVisible || this.frame != 0
					|| (this.viewState && (this.viewState & 4))) {
				this.iconEffectObj.hide()
			} else {
				if (this.iconEffectVisible) {
					this.iconEffectObj.show(this.wid, this.hei)
				}
			}
		}
	};
	s7sdk.set.SpinView.prototype.viewInvalidate = function(j) {
		if (this.currentFrame == null) {
			return
		}
		var h = this.currentFrame.view;
		var c = new s7sdk.Rectangle(Math.round(j.x * h.imageWidth), Math
				.round(j.y * h.imageHeight),
				Math.round(j.width * h.imageWidth), Math.round(j.height
						* h.imageHeight));
		s7sdk.Event.dispatch(this.obj, new s7sdk.event.ZoomRgnEvent(
				s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_NRGN, j), false);
		s7sdk.Event.dispatch(this.obj, new s7sdk.event.ZoomRgnEvent(
				s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_RGN, c), false);
		if (!this.lastViewPort || this.lastViewPort.isEmpty()
				|| j.equals(this.lastViewPort)) {
			this.lastViewPort = j;
			return
		}
		var b = this.imagePixelsToViewPoint(c.topLeft());
		var a = this.imagePixelsToViewPoint(c.bottomRight());
		var d = (a.y - b.y) / (j.height * h.imageHeight);
		d = Math.round((d + 0.00005) * 10000) / 100;
		if (d != this.lastScale) {
			if (!h.inTransition) {
			}
			this.lastScale = d
		} else {
			var f = this.imagePixelsToViewPoint(new s7sdk.Point2D(Math
					.round(this.lastViewPort.x * h.imageWidth), Math
					.round(this.lastViewPort.y * h.imageHeight)));
			var k = Math.round(f.x - b.x);
			var i = Math.round(f.y - b.y);
			if (k != 0 || i != 0) {
				var g = new s7sdk.event.ZoomPanEvent(
						s7sdk.event.ZoomPanEvent.NOTF_ZOOM_NPAN,
						this.lastViewPort.x - j.x, this.lastViewPort.y - j.y);
				s7sdk.Event.dispatch(this.obj, g, false);
				g = new s7sdk.event.ZoomPanEvent(
						s7sdk.event.ZoomPanEvent.NOTF_ZOOM_PAN, k, i);
				s7sdk.Event.dispatch(this.obj, g, false)
			}
		}
		this.lastViewPort = j
	};
	s7sdk.set.SpinView.prototype.viewTransitionStop = function() {
		var a = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.ZOOM, [ Math
				.round(this.lastScale) ], true);
		s7sdk.Event.dispatch(this.obj, a, false)
	};
	s7sdk.set.SpinView.prototype.viewStateChange = function(a) {
		if (a == this.viewState) {
			return
		}
		this.viewState = a;
		this.checkIconEffect();
		if (this.panSpinMode) {
			this.applyPanSpin()
		}
		this.checkCursor();
		if (this.currentFrame != null) {
			this.stateChangeNotify()
		}
	};
	s7sdk.set.SpinView.prototype.viewStatusChange = function(a) {
	};
	s7sdk.set.SpinView.prototype.getState = function() {
		s7sdk.Logger
				.log(
						s7sdk.Logger.WARNING,
						"s7sdk.set.SpinView.getState - This method has been deprecated, use getCapabilityState() instead!");
		return this.getCapabilityState()
	};
	s7sdk.set.SpinView.prototype.getZoomLevel = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.set.SpinView.getZoomLevel");
		if (this.currentFrame != null && this.currentFrame.view != null) {
			var a = this.currentFrame.view;
			if (Math.abs(a.topScale - a.initScale) > s7sdk.View.epsilon2) {
				var b = (a.viewToImage.d - a.initScale)
						/ (a.topScale - a.initScale);
				if (!isNaN(b - 0)) {
					b = b < 0 ? 0 : b;
					b = b > 1 ? 1 : b;
					return Math.round(b * 100)
				}
			}
		}
		return 0
	};
	s7sdk.set.SpinView.prototype.getFramesLength = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.getFramesLength");
		return this.spinSetFrames.length
	};
	s7sdk.set.SpinView.prototype.getCurrentFrame = function() {
		return this.currentFrame
	};
	s7sdk.set.SpinView.prototype.getCurrentFrameIndex = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.getCurrentFrameIndex");
		return this.frameIdx(this.frame)
	};
	s7sdk.set.SpinView.prototype.setCurrentFrameIndex = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.setCurrentFrameIndex - val: %0", b);
		if (b < 0 || b > this.spinSetFrames.length - 1
				|| b == this.frameIdx(this.frame)) {
			return
		}
		this.zoomReset();
		var a = (this.frameIdx(this.frame) < b) ? s7sdk.Enum.SPIN_DIRECTION.WEST
				: s7sdk.Enum.SPIN_DIRECTION.EAST;
		if (this.direction != a) {
			this.stopSpin();
			this.direction = a
		}
		this.frame = b;
		this.frameQueue.push(b);
		this.adjustSpeed()
	};
	s7sdk.set.SpinView.prototype.imagePixelsToViewPoint = function(b) {
		if (this.currentFrame == null || this.currentFrame.view == null) {
			return new Point2D(Number.POSITIVEINFINITY, Number.POSITIVEINFINITY)
		}
		var a = this.currentFrame.view.imagePixelsToViewPoint(b);
		a.offset(this.currentFrame.view.x, this.currentFrame.view.y);
		return a
	};
	s7sdk.set.SpinView.prototype.zoomIn = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.set.SpinView.zoomIn");
		if (this.currentFrame.view) {
			this.currentFrame.view.zoomIn()
		}
	};
	s7sdk.set.SpinView.prototype.zoomOut = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.set.SpinView.zoomOut");
		if (this.currentFrame.view) {
			this.currentFrame.view.zoomOut()
		}
	};
	s7sdk.set.SpinView.prototype.zoomReset = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.set.SpinView.zoomReset");
		if (this.currentFrame && this.currentFrame.view) {
			this.currentFrame.view.zoomReset()
		}
	};
	s7sdk.set.SpinView.prototype.zoomNPan = function(b, a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.zoomNPan - dx: %0, dy: %1", b, a);
		if (this.currentFrame.view && (b != 0 || a != 0)) {
			this.currentFrame.view.doNPan(b, a);
			var c = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.PAN, [],
					true);
			s7sdk.Event.dispatch(this.obj, c, false)
		}
	};
	s7sdk.set.SpinView.prototype.imagePixelsToViewPoint = function(b) {
		if (this.currentFrame == null || this.currentFrame.view == null) {
			return new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
		}
		var a = this.currentFrame.view.imagePixelsToViewPoint(b);
		return a
	};
	s7sdk.set.SpinView.prototype.getCapabilityState = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.getCapabilityState");
		var b = new s7sdk.SpinCapabilityState(this.viewState);
		b.removeCapability(s7sdk.SpinCapabilityState.SPIN_WEST
				| s7sdk.SpinCapabilityState.SPIN_EAST
				| s7sdk.SpinCapabilityState.SPIN_NORTH
				| s7sdk.SpinCapabilityState.SPIN_SOUTH);
		if (this.dragToSpin == true) {
			b.removeCapability(s7sdk.SpinCapabilityState.PAN_LEFT
					| s7sdk.SpinCapabilityState.PAN_RIGHT
					| s7sdk.SpinCapabilityState.PAN_UP
					| s7sdk.SpinCapabilityState.PAN_DOWN)
		}
		if (this.spinSet2D) {
			var d = this.currentFrame.position;
			var a = this.maxFramesPerRow - 1;
			var c = this.getFramesLength() / this.maxFramesPerRow - 1;
			if (this.maxFramesPerRow > 1) {
				b.setCapability(s7sdk.SpinCapabilityState.SPIN_WEST
						| s7sdk.SpinCapabilityState.SPIN_EAST)
			}
			if (c > 1) {
				if ((d.y > 0) && (d.y < c)) {
					b.setCapability(s7sdk.SpinCapabilityState.SPIN_NORTH
							| s7sdk.SpinCapabilityState.SPIN_SOUTH)
				} else {
					if (d.y == 0) {
						b
								.removeCapability(s7sdk.SpinCapabilityState.SPIN_SOUTH);
						b.setCapability(s7sdk.SpinCapabilityState.SPIN_NORTH)
					} else {
						if (d.y == c) {
							b
									.removeCapability(s7sdk.SpinCapabilityState.SPIN_NORTH);
							b
									.setCapability(s7sdk.SpinCapabilityState.SPIN_SOUTH)
						}
					}
				}
			}
		} else {
			if (this.getFramesLength() > 1) {
				b.setCapability(s7sdk.SpinCapabilityState.SPIN_WEST
						| s7sdk.SpinCapabilityState.SPIN_EAST)
			} else {
			}
		}
		return b
	};
	s7sdk.set.SpinView.prototype.stateChangeNotify = function() {
		var a = this.getCapabilityState();
		if (!this.currentSpinState || this.currentSpinState.state != a.state) {
			this
					.dispatchEvent(new s7sdk.event.CapabilityStateEvent(
							s7sdk.event.CapabilityStateEvent.NOTF_SPIN_CAPABILITY_STATE,
							a));
			this.currentSpinState = a
		}
	};
	s7sdk.set.SpinView.prototype.zoomRgn = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.zoomRgn - rgn: %0", a);
		if (this.currentFrame.view) {
			this.currentFrame.view.zoomRgn(a)
		}
	};
	s7sdk.set.SpinView.prototype.zoomNRgn = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.set.SpinView.zoomNRgn - rgn: %0", a);
		if (this.currentFrame.view) {
			this.currentFrame.view.zoomNRgn(a)
		}
	};
	s7sdk.SpinView = s7sdk.set.SpinView;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		extraRulesText = (typeof extraRulesText === "string") ? extraRulesText
				: "";
		var a = c(".s7spinview", {
			"background-color" : "#ffffff",
			"user-select" : "none",
			"-moz-user-select" : "-moz-none",
			"-webkit-user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)",
			filter : "alpha(opacity=100)",
			opacity : "1"
		}) + c(".s7spinview .s7iconeffect", {
			width : "120px",
			height : "120px",
			"-webkit-transform" : "translateZ(0px)",
			"background-repeat" : "no-repeat",
			"background-position" : "center"
		}) + c(".s7spinview .s7iconeffect[state='spin_1D']", {
			"background-image" : b("spinicon.png")
		}) + c(".s7spinview .s7iconeffect[state='spin_2D']", {
			"background-image" : b("spinicon_2D.png")
		});
		s7sdk.Util.css.addDefaultCSS(a, "SpinView")
	})()
}
if (!s7sdk.SpinViewUtil) {
	s7sdk.SpinViewUtil = new function SpinViewUtil() {
		var c = this;
		this.line = function b(h, o, g, n, l) {
			var q = Math.abs(g - h), p = Math.abs(n - o), m, k, i = q - p, j;
			m = (h < g) ? 1 : -1;
			k = (o < n) ? 1 : -1;
			while (1) {
				l(h, o);
				if (h === g && o === n) {
					break
				}
				j = 2 * i;
				if (j > -p) {
					i -= p;
					h += m
				}
				if (j < q) {
					i += q;
					o += k
				}
			}
		};
		this.circle = function f(h, o, k, m) {
			var j = 1 - k, i = 1, g = -2 * k, n = 0, l = k;
			m(h, o + k);
			m(h, o - k);
			m(h + k, o);
			m(h - k, o);
			while (n < l) {
				if (j >= 0) {
					l--;
					g += 1;
					j += g
				}
				n++;
				i += 2;
				j += i;
				m(h + n, o + l);
				m(h - n, o + l);
				m(h + n, o - l);
				m(h - n, o - l);
				m(h + l, o + n);
				m(h - l, o + n);
				m(h + l, o - n);
				m(h - l, o - n)
			}
		};
		this.filledCircle = function a(h, j, g, i) {
			this.circle(h, j, g, function(l, k) {
				i(l, k);
				if (k <= j) {
					c.line(l, k, l, k + (j - k) * 2, i)
				}
			})
		};
		this.filledSlice = function e(i, p, n, r, q, o) {
			var l = Math.round(n * Math.cos(r)) + i;
			var h = Math.round(n * Math.sin(r)) + p;
			var k = Math.round(n * Math.cos(q)) + i;
			var g = Math.round(n * Math.sin(q)) + p;
			var m = {};
			this.line(i, p, l, h, j);
			this.line(i, p, k, g, j);
			this.line(l, h, k, g, j);
			function j(t, u) {
				o(t, u);
				m[t] = m[t] || [];
				m[t].push(u)
			}
			for ( var s in m) {
				if (m.hasOwnProperty(s)) {
					s = parseInt(s);
					this.line(s, Math.max.apply(null, m[s]), s, Math.min.apply(
							null, m[s]), o)
				}
			}
		};
		this.uniquePixelSetter = function d(h) {
			var i = {};
			return function g(j, k) {
				i[j] = i[j] || {};
				if (!i[j][k]) {
					i[j][k] = true;
					h(j, k)
				}
			}
		}
	}
};