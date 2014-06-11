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
s7sdk.pkg("s7sdk.image");
if (s7sdk.browser.name === "ie") {
	s7sdk.Util.require("s7sdk.image.rgn.View")
} else {
	s7sdk.Util.require("s7sdk.image.View")
}
s7sdk.Util.require("s7sdk.common.IS");
s7sdk.Util.require("s7sdk.common.IconEffect");
s7sdk.Util.require("s7sdk.common.ItemDesc");
s7sdk.Util.require("s7sdk.event.InputController");
if (!s7sdk.image.ZoomView) {
	s7sdk.image.ZoomView = function ZoomView(b, e, d) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.CONFIG,
						"s7sdk.image.ZoomView constructor - containerId: %0, settings: %1 , compId: %2",
						b, e, d);
		arguments.callee.superclass.apply(this,
				[ d, b, "div", "s7zoomview", e ]);
		this.createElement();
		this.container = s7sdk.Util.byId(b);
		if (this.container.tagName == "DIV"
				&& (!this.container.style.position || this.container.style.position == "static")) {
			this.container.style.position = "relative"
		}
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
		this.view = null;
		if (this.serverUrl.lastIndexOf("/") != (this.serverUrl.length - 1)) {
			this.serverUrl += "/"
		}
		this.compId = (s7sdk.Util.isNull(d) ? "" : d);
		this.locale = this.getParam("locale", "");
		this.imageModifier = s7sdk.MediaSetParser
				.parseAssetForSetReq(this.asset).mod;
		this.wid = this.stagesize.width;
		this.hei = this.stagesize.height;
		if (this.wid == 0 || this.hei == 0) {
			this.wid = this.size.width;
			this.hei = this.size.height
		}
		if (this.wid == 0 || this.hei == 0) {
			this.wid = parseInt(s7sdk.Util.css.getCss("s7zoomview", "width",
					this.compId, null, this.container));
			this.hei = parseInt(s7sdk.Util.css.getCss("s7zoomview", "height",
					this.compId, null, this.container));
			if (!s7sdk.Util.isNumber(this.wid)
					|| !s7sdk.Util.isNumber(this.hei) || this.wid <= 0
					|| this.hei <= 0) {
				if ("clientHeight" in this.container
						&& "clientWidth" in this.container) {
					this.wid = this.container.clientWidth;
					this.hei = this.container.clientHeight
				}
				if (this.wid == 0 || this.hei == 0) {
					this.wid = 400;
					this.hei = 400
				}
			}
		}
		this.devicePixelRatio = s7sdk.Util.adjustDevicePixelRatio(
				this.enableHD.maxHdPixels, this.hei, this.wid);
		this.outWidth = this.wid * this.devicePixelRatio;
		this.outHeight = this.hei * this.devicePixelRatio;
		this.item = null;
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
		var g = s7sdk.MediaSetParser.parseAssetForSetReq(this.asset);
		var f = this.serverUrl + "/" + g.name;
		f += "?" + g.req;
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			f += "&locale=" + this.locale
		}
		this.mediaSet = null;
		this.obj.style.width = this.wid + "px";
		this.obj.style.height = this.hei + "px";
		if (this.frametransition.transition == "slide"
				|| this.frametransition.transition == "fade") {
			this.prevFrame = {};
			this.obj.style.overflow = "hidden";
			this.spacing = this.frametransition.transition == "fade" ? 0
					: this.frametransition.spacing * this.wid;
			this.container3 = s7sdk.Util.createObj(null, "div", null, null);
			this.container3.style.zIndex = 0;
			this.container3.style.position = "absolute";
			this.container3.style.left = -(this.wid + this.spacing) + "px";
			this.container3.style.width = 3 * (this.wid + this.spacing) + "px";
			this.container3.style.height = this.hei + "px";
			this.tempDisplay = new s7sdk.ViewWrapper(this, 0, 0, 0, this.hei,
					0, this.spacing, 900);
			this.displ = new s7sdk.ViewWrapper(this, this.outWidth,
					this.outHeight, this.wid, this.hei, 1, this.spacing, 910);
			this.addIE78overlay();
			this.displayElement = this.displ.displayElement;
			this.left = new s7sdk.ViewWrapper(this, this.outWidth,
					this.outHeight, this.wid, this.hei, 0, this.spacing, 900);
			this.right = new s7sdk.ViewWrapper(this, this.outWidth,
					this.outHeight, this.wid, this.hei, 2, this.spacing, 920);
			this.container3.appendChild(this.tempDisplay.obj);
			this.container3.appendChild(this.left.obj);
			this.container3.appendChild(this.displ.obj);
			this.container3.appendChild(this.right.obj);
			this.obj.appendChild(this.container3);
			this.initialSlide = false;
			this.view = null;
			this.animate = new s7sdk.ZoomSlide(this,
					this.frametransition.duration)
		} else {
			this.container3 = s7sdk.Util.createObj(null, "div", null, null);
			this.container3.style.zIndex = 0;
			this.container3.style.position = "absolute";
			this.container3.style.left = 0 + "px";
			this.container3.style.width = this.wid + "px";
			this.container3.style.height = this.hei + "px";
			this.spacing = 0;
			this.tempDisplay = new s7sdk.ViewWrapper(this, 0, 0, 0, this.hei,
					0, this.spacing, 900);
			this.displ = new s7sdk.ViewWrapper(this, this.outWidth,
					this.outHeight, this.wid, this.hei, 0, this.spacing, 910);
			this.addIE78overlay();
			this.displayElement = this.displ.displayElement;
			this.container3.appendChild(this.tempDisplay.obj);
			this.container3.appendChild(this.displ.obj);
			this.obj.appendChild(this.container3)
		}
		this.displayElement.s7gesture = new s7sdk.Gesture();
		if (this.container.firstChild) {
			this.container.insertBefore(this.obj, this.container.firstChild)
		} else {
			this.container.appendChild(this.obj)
		}
		this.displayElement.onselectstart = function() {
			return false
		};
		this.iconEffectObj = new s7sdk.IconEffect(this,
				this.iconEffect.enabled, this.iconEffect.count,
				this.iconEffect.fade, this.iconEffect.autoHide);
		if (this.animate) {
			this.iconEffectObj.iconEffectDiv_.style.zIndex = 1000
		}
		this.iconEffectVisible = true;
		var c = this;
		this.handler = new s7sdk.InputController(this.ovrl ? this.displ.obj
				: this.displayElement);
		this.handler.singleTapCallback = function(i, h, j) {
			h -= s7sdk.Util.getObjPos(c.obj).x;
			j -= s7sdk.Util.getObjPos(c.obj).y;
			if (c.view) {
				if (c.clickToZoom & s7sdk.Enum.CLICK_STATE.CLICK_TO_ZOOM) {
					if (c.clickToZoom & s7sdk.Enum.CLICK_STATE.CLICK_TO_RESET) {
						if (c.view.state & 1) {
							c.view.zoomClick(h, j, i.shiftKey)
						} else {
							c.view.zoomReset()
						}
					} else {
						c.view.zoomClick(h, j, i.shiftKey)
					}
				} else {
					if (c.view.clickToZoom
							& s7sdk.Enum.CLICK_STATE.CLICK_TO_RESET) {
						c.view.zoomReset()
					}
				}
			}
			s7sdk.Event.dispatch(c.obj, s7sdk.Event.CLICK, false)
		};
		this.handler.doubleTapCallback = function(i, h, j) {
			h -= s7sdk.Util.getObjPos(c.obj).x;
			j -= s7sdk.Util.getObjPos(c.obj).y;
			if (c.view) {
				if (c.clickToZoom & s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_ZOOM) {
					if (c.clickToZoom
							& s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_RESET) {
						if (c.view.state & 1) {
							c.view.zoomClick(h, j, i.shiftKey)
						} else {
							c.view.zoomReset()
						}
					} else {
						c.view.zoomClick(h, j, i.shiftKey)
					}
				} else {
					if (c.clickToZoom
							& s7sdk.Enum.CLICK_STATE.DOUBLE_CLICK_TO_RESET) {
						c.view.zoomReset()
					}
				}
			}
		};
		this.handler.swipeCallback = function(h) {
			if (c.view) {
				if (!(c.state & 4)) {
					if (h == "right") {
						c.onSwipeLeft()
					}
					if (h == "left") {
						c.onSwipeRight()
					}
				} else {
					c.view.inPinch = false;
					c.view.inPan = false;
					c.view.doPan(0, 0, false);
					c.invalidate();
					var i = new s7sdk.event.UserEvent(
							s7sdk.event.UserEvent.PAN, [], true);
					s7sdk.Event.dispatch(c.obj, i, false)
				}
				c.setInPan(false)
			}
		};
		if (this.animate) {
			this.handler.startTouchCallback = function(i, h, j) {
				if (c.view && !(c.state & 4)
						&& c.frametransition.transition == "slide") {
					c.startMoveCtnr3(h, j)
				}
			};
			this.handler.touchCancel = function(h) {
				if (c.view && !(c.state & 4)
						&& c.frametransition.transition == "slide") {
					c.touchCancelCtnr3(h)
				}
			}
		}
		this.handler.dragCallback = function(k, h, l, j, i) {
			if (c.view) {
				if (!(c.state & 4) && c.animate
						&& c.frametransition.transition == "slide") {
					c.doMoveCtnr3(j, i);
					c.setInPan(c.frametransition.transition == "slide" ? true
							: false)
				} else {
					c.view.inPan = true;
					c.view.doPan(j, i, true);
					c.setInPan(true)
				}
			}
		};
		this.handler.endDragCallback = function(k, h, m, j, i) {
			if (c.view) {
				if (!(c.state & 4) && c.animate
						&& c.frametransition.transition == "slide") {
					c.finalizeMoveCtnr3(j, i)
				} else {
					c.view.inPinch = false;
					c.view.inPan = false;
					c.view.doPan(0, 0, false);
					c.invalidate();
					var l = new s7sdk.event.UserEvent(
							s7sdk.event.UserEvent.PAN, [], true);
					s7sdk.Event.dispatch(c.obj, l, false)
				}
				c.setInPan(false)
			}
		};
		this.handler.pinchCallback = function(i, h, k, j) {
			if (c.view) {
				h -= s7sdk.Util.getObjPos(c.obj).x;
				k -= s7sdk.Util.getObjPos(c.obj).y;
				c.view.inPinch = true;
				c.view.pinchZoom(h, k, j, c.view.viewToImage)
			}
		};
		this.handler.endPinchCallback = function(i, h, k, j) {
			if (c.view) {
				c.view.inPinch = false;
				c.view.inPan = false;
				s7sdk.Logger.log(s7sdk.Logger.FINEST,
						"s7sdk.image.ZoomView.endPinchCallback - invalidate");
				c.view.invalidate(false);
				c.invalidate()
			}
		};
		if (s7sdk.browser.name === "ie" && s7sdk.browser.version.minor <= 8) {
			var a = c.handler;
			this.handlerOverlay = new s7sdk.InputController(this.iconEffectObj);
			this.handlerOverlay.singleTapCallback = function(i, h, j) {
				a.singleTapCallback(i, h, j)
			};
			this.handlerOverlay.doubleTapCallback = function(i, h, j) {
				a.doubleTapCallback(i, h, j)
			};
			this.handlerOverlay.swipeCallback = function(h) {
				a.swipeCallback(h)
			};
			this.handlerOverlay.dragCallback = function(k, h, l, j, i) {
				a.dragCallback(k, h, l)
			};
			this.handlerOverlay.endDragCallback = function(k, h, l, j, i) {
				a.endDragCallback(k, h, l)
			};
			this.handlerOverlay.pinchCallback = function(i, h, k, j) {
				a.pinchCallback(i, h, k)
			};
			this.handlerOverlay.endPinchCallback = function(i, h, k, j) {
				a.endPinchCallback(i, h, k)
			}
		}
		this.iconEffectVisibility = {
			show : function() {
				c.iconEffectVisible = true;
				c.checkIconEffect()
			},
			hide : function() {
				c.iconEffectVisible = false;
				c.checkIconEffect()
			}
		};
		if (this.asset && this.asset.length > 0) {
			this.isReq = new s7sdk.IS(this.serverUrl, this.asset);
			this.isReq.getHttpReq(f, function(i, h) {
				s7sdk.image.ZoomView.prototype.loadRequest.apply(h, [ i ])
			}, null, this)
		}
	};
	s7sdk.Class.inherits("s7sdk.image.ZoomView", "s7sdk.UIComponent");
	s7sdk.image.ZoomView.prototype.modifiers = {
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
		zoomStep : {
			params : [ "step", "limit" ],
			defaults : [ 1, 1 ]
		},
		transition : {
			params : [ "time", "easing" ],
			defaults : [ 0.5, 0 ],
			ranges : [ "0:", "0:5" ],
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
		reset : {
			params : [ "reset" ],
			defaults : [ true ]
		},
		frametransition : {
			params : [ "transition", "duration", "spacing" ],
			ranges : [ [ "none", "fade", "slide" ], "0:", "0:1" ],
			defaults : [ "none", 0.3, 0 ]
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
		}
	};
	s7sdk.image.ZoomView.prototype.dispose = function() {
		if (this.view) {
			this.view.unload(8)
		}
	};
	s7sdk.image.ZoomView.prototype.addIE78overlay = function() {
		if (s7sdk.browser.name === "ie" && s7sdk.browser.version.minor <= 8) {
			var a = document.createElement("div");
			a.className = "s7zoomview";
			a.style.position = "absolute";
			a.style.top = "0px";
			a.style.left = "0px";
			a.style.width = this.wid + "px";
			a.style.height = this.hei + "px";
			a.style.backgroundColor = "rgb(0,0,0)";
			a.style.filter = "alpha(opacity =0)";
			a.style.zIndex = 915;
			this.ovrl = a;
			this.displ.obj.appendChild(a)
		}
	};
	s7sdk.image.ZoomView.prototype.addEventListener = function(c, b, a) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.image.ZoomView.addEventListener - type: %0, handler: %1, useCapture: %2",
						c,
						b.toString().substring(0, b.toString().indexOf("(")), a);
		this.superproto.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.image.ZoomView.prototype.setItem = function(e) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.setItem - item: %0", e);
		if (this.isReq) {
			this.isReq.cancelHttpReq()
		}
		if (e instanceof s7sdk.ItemDesc == false) {
			throw new Error("Item must be a descendant of ItemDesc!")
		}
		if (e.parent == null) {
			throw new Error("ItemDesc must be part of a parent set!")
		}
		if (this.animate) {
			var b;
			this.msFrame = {
				isNew : false,
				frame : -1
			};
			if (this.mediaSet == null || this.item == null) {
				b = false
			} else {
				this.msFrame.isNew = this.compareSet(this.mediaSet, e.parent, [
						"name", "items.length" ]);
				b = this.compareSet(this.item, e, [ "name", "version" ]);
				this.msFrame.frame = this.getIndexFromItem(this.item)
			}
			if (this.msFrame.isNew && b) {
				return
			}
			this.mediaSet = e.parent;
			this.item = e;
			var d = this.getIndexFromItem(this.item);
			if (this.view) {
				this.initialSlide = true;
				this.createViewExt(this.item,
						this.msFrame.frame > d ? this.left : this.right)
			} else {
				this.initialSlide = false;
				this.createView(this.item);
				var a = Math.min(Math.max(0, d - 1),
						this.mediaSet.items.length - 1);
				var c = Math.min(Math.max(0, d + 1),
						this.mediaSet.items.length - 1);
				if (d == (this.mediaSet.items.length - 1)) {
					this.createViewExt(this.mediaSet.items[a], this.left)
				} else {
					if (d == 0) {
						this.createViewExt(this.mediaSet.items[c], this.right)
					} else {
						this.createViewExt(this.mediaSet.items[a], this.left);
						this.createViewExt(this.mediaSet.items[c], this.right)
					}
				}
			}
		} else {
			this.mediaSet = e.parent;
			this.item = e;
			this.createView(this.item)
		}
		if (s7sdk.browser.device.name == "desktop") {
			s7sdk.Util.css.setCSSAttributeSelector(this.obj, "cursortype",
					"zoomin")
		}
	};
	s7sdk.image.ZoomView.prototype.compareSet = function(h, d, f) {
		this.getVal = function(k, j) {
			if (j.length == 0) {
				return k
			}
			var l = j.shift();
			var i = k[l];
			return this.getVal(i, j)
		};
		for ( var c = 0; c < f.length; c++) {
			var g = f[c];
			var b = g.split(".");
			var e = this.getVal(h, b);
			b = g.split(".");
			var a = this.getVal(d, b);
			if (e != a) {
				return false
			}
		}
		return true
	};
	s7sdk.image.ZoomView.prototype.doInitialSlide = function() {
		if (!this.initialSlide || !this.view) {
			return
		}
		this.initialSlide = false;
		var c = this.getIndexFromItem(this.item);
		var d = Math.min(Math.max(0, c + 1), this.mediaSet.items.length - 1);
		this.animate.inTransition = false;
		this.animate.stop();
		this.container3.relativePos = parseInt(this.container3.style.left)
				+ (this.wid + this.spacing);
		var a = Math.abs(this.container3.relativePos) / this.wid;
		var b = this.msFrame.frame > c;
		this.animate.start(b, a, false, c, d, true);
		this.animate.custom = false
	};
	s7sdk.image.ZoomView.prototype.loadRequest = function(a) {
		this.mediaSet = s7sdk.MediaSetParser.parse(a.set, this.imageModifier);
		if (this.mediaSet.items.length > 0
				&& this.mediaSet.items[0] instanceof s7sdk.ItemDesc) {
			if (this.animate && this.mediaSet.items.length > 1) {
				this.createViewExt(this.mediaSet.items[1], this.right)
			}
			this.item = this.mediaSet.items[0];
			this.createView(this.item)
		} else {
			throw new Error(
					"Set response did not contain valid items! Set may be empty.")
		}
	};
	s7sdk.image.ZoomView.prototype.createViewExt = function(d, a) {
		if (a.view) {
			a.view.unload(1 | 8)
		}
		var b = new s7sdk.Rectangle(0, 0, d.width, d.height);
		var e = d.name;
		function c(g, f, h) {
			g += ((g.indexOf("?") == -1) ? "?" : "&") + f;
			g += (typeof h == "undefined") ? "" : "=" + h;
			return g
		}
		if (this.iscommand != null && this.iscommand.length > 0) {
			e = c(e, this.iscommand)
		}
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			e = c(e, "locale", this.locale)
		}
		if (s7sdk.Util.isNonEmptyString(d.version)) {
			e = c(e, "id", d.version)
		}
		a.view = new s7sdk.View(this.serverUrl + e, b.width, b.height,
				this.outWidth, this.outHeight, this.devicePixelRatio,
				this.zoomStep.step, this.zoomStep.limit, this.transition.time,
				this.transition.easing, null, this.elasticZoom,
				this.clickToZoom, this.fmt, 0, true);
		a.view.viewParent = a;
		a.view.attach(a);
		if (a.view.resetImageLoaded) {
			a.onReadyToDislpay()
		}
	};
	s7sdk.image.ZoomView.prototype.createView = function(d) {
		var a = null;
		if (this.view) {
			if (!this.reset) {
				a = this.view.getViewPort()
			}
			this.view.unload(1 | 8)
		}
		var b = new s7sdk.Rectangle(0, 0, d.width, d.height);
		var f = d.name;
		function c(h, g, i) {
			h += ((h.indexOf("?") == -1) ? "?" : "&") + g;
			h += (typeof i == "undefined") ? "" : "=" + i;
			return h
		}
		if (this.iscommand != null && this.iscommand.length > 0) {
			f = c(f, this.iscommand)
		}
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			f = c(f, "locale", this.locale)
		}
		if (s7sdk.Util.isNonEmptyString(d.version)) {
			f = c(f, "id", d.version)
		}
		this.view = new s7sdk.View(this.serverUrl + f, b.width, b.height,
				this.outWidth, this.outHeight, this.devicePixelRatio,
				this.zoomStep.step, this.zoomStep.limit, this.transition.time,
				this.transition.easing, a, this.elasticZoom, this.clickToZoom,
				this.fmt, 0, true);
		this.view.viewParent = this;
		if (this.container) {
			this.view.attach(this)
		}
		this.viewStateChange(this.view.state);
		this.settings.trackLoad(this);
		var e = new s7sdk.AssetEvent(s7sdk.event.AssetEvent.ASSET_CHANGED, d,
				this.getIndexFromItem(d), true);
		this.dispatchEvent(e)
	};
	s7sdk.image.ZoomView.prototype.getIndexFromItem = function(d) {
		if (this.mediaSet == null) {
			throw new Error(
					"Cannot get index of item because media-set is does not exist!")
		}
		var c = -1;
		var b = this.mediaSet.items;
		for ( var a = 0; a < b.length; a++) {
			if (b[a].name == d.name) {
				c = a;
				break
			}
		}
		return c
	};
	s7sdk.image.ZoomView.prototype.setAsset = function(a) {
		if (typeof a != "string") {
			throw new Error("Asset name must be represented by a string!")
		}
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.setAsset - asset: %0", a);
		if (a == "") {
			return
		}
		var e = this.asset;
		this.asset = unescape(a);
		this.mediaSet = null;
		var c = s7sdk.MediaSetParser.parseAssetForSetReq(this.asset);
		var b = this.serverUrl + "/" + c.name;
		b += "?" + c.req;
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			b += "&locale=" + this.locale
		}
		if (this.isReq) {
			this.isReq.cancelHttpReq()
		}
		this.isReq = new s7sdk.IS(this.serverUrl, this.asset);
		this.isReq.getHttpReq(b, function(g, f) {
			s7sdk.image.ZoomView.prototype.loadRequest.apply(f, [ g ])
		}, null, this);
		if (e != this.asset && e != null) {
			var d = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.SWAP, [ 0,
					this.asset ], true);
			s7sdk.Event.dispatch(this.obj, d, false)
		}
	};
	s7sdk.image.ZoomView.prototype.getAsset = function() {
		return this.asset
	};
	s7sdk.image.ZoomView.prototype.zoomIn = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.image.ZoomView.zoomIn");
		if (this.view) {
			this.view.zoomIn()
		}
	};
	s7sdk.image.ZoomView.prototype.zoomOut = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.image.ZoomView.zoomOut");
		if (this.view) {
			this.view.zoomOut()
		}
	};
	s7sdk.image.ZoomView.prototype.zoomReset = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.image.ZoomView.zoomReset");
		if (this.view) {
			this.view.zoomReset()
		}
	};
	s7sdk.image.ZoomView.prototype.zoomNPan = function(b, a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.zoomNPan - dx: %0, dy: %1", b, a);
		if (this.view) {
			this.view.doNPan(b, a)
		}
	};
	s7sdk.image.ZoomView.prototype.zoomNRgn = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.zoomNRgn - rgn: %0", a);
		if (this.view) {
			this.view.zoomNRgn(a)
		}
	};
	s7sdk.image.ZoomView.prototype.zoomRgn = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.zoomRgn - rgn: %0", a);
		if (this.view) {
			this.view.zoomRgn(a)
		}
	};
	s7sdk.image.ZoomView.prototype.viewInvalidate = function(g) {
		var d = new s7sdk.Rectangle(Math.round(g.x * this.view.imageWidth),
				Math.round(g.y * this.view.imageHeight), Math.round(g.width
						* this.view.imageWidth), Math.round(g.height
						* this.view.imageHeight));
		s7sdk.Event.dispatch(this.obj, new s7sdk.event.ZoomRgnEvent(
				s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_NRGN, g), false);
		s7sdk.Event.dispatch(this.obj, new s7sdk.event.ZoomRgnEvent(
				s7sdk.event.ZoomRgnEvent.NOTF_ZOOM_RGN, d), false);
		if (!this.lastViewPort || this.lastViewPort.isEmpty()
				|| g.equals(this.lastViewPort)) {
			this.lastViewPort = g;
			return
		}
		var b = this.imagePixelsToViewPoint(d.topLeft());
		var a = this.imagePixelsToViewPoint(d.bottomRight());
		var e = (a.y - b.y) / (g.height * this.view.imageHeight);
		e = Math.round((e + 0.00005) * 10000) / 100;
		if (e != this.lastScale) {
			if (!this.view.inTransition) {
			}
			this.lastScale = e
		} else {
			var f = this.imagePixelsToViewPoint(new s7sdk.Point2D(Math
					.round(this.lastViewPort.x * this.view.imageWidth), Math
					.round(this.lastViewPort.y * this.view.imageHeight)));
			var i = Math.round(f.x - b.x);
			var h = Math.round(f.y - b.y);
			if (i != 0 || h != 0) {
				var c = new s7sdk.event.ZoomPanEvent(
						s7sdk.event.ZoomPanEvent.NOTF_ZOOM_NPAN,
						this.lastViewPort.x - g.x, this.lastViewPort.y - g.y);
				s7sdk.Event.dispatch(this.obj, c, false);
				c = new s7sdk.event.ZoomPanEvent(
						s7sdk.event.ZoomPanEvent.NOTF_ZOOM_PAN, i, h);
				s7sdk.Event.dispatch(this.obj, c, false)
			}
		}
		this.lastViewPort = g
	};
	s7sdk.image.ZoomView.prototype.viewTransitionStop = function() {
		var a = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.ZOOM,
				[ this.lastScale ], true);
		s7sdk.Event.dispatch(this.obj, a, false)
	};
	s7sdk.image.ZoomView.prototype.setInPan = function(a) {
		if (this.state & 4) {
			if (this.inPan != (a && (this.state & 4))) {
				this.inPan = a && (this.state & 4);
				this.cursorChange(this.view.state)
			}
		} else {
			if (this.frametransition.transition == "slide") {
				this.inPan = a;
				this.cursorChange(this.view.state | (a ? 2048 : 0))
			}
		}
	};
	s7sdk.image.ZoomView.prototype.cursorChange = function(d) {
		if (s7sdk.browser.device.name != "desktop") {
			return
		}
		var b = [ "default", "zoomin", "reset", "drag", "slide" ];
		var a = d == 0 ? 0 : (this.inPan ? ((d & 2048) ? 4 : 3) : (d & 8 ? 1
				: 2));
		if (this.prevCur == a) {
			return
		}
		this.prevCur = a;
		s7sdk.Util.css.setCSSAttributeSelector(this.obj, "cursortype", b[a]);
		var c = this.obj.offsetWidth
	};
	s7sdk.image.ZoomView.prototype.viewStateChange = function(a) {
		var b = this.state != a;
		this.state = a;
		this.cursorChange(a);
		if (b) {
			this
					.dispatchEvent(new s7sdk.event.CapabilityStateEvent(
							s7sdk.event.CapabilityStateEvent.NOTF_ZOOM_CAPABILITY_STATE,
							new s7sdk.ZoomCapabilityState(this.state)))
		}
		this.checkIconEffect()
	};
	s7sdk.image.ZoomView.prototype.checkIconEffect = function() {
		if (this.iconEffectObj.enabled) {
			if (!this.iconEffectVisible || (this.state & 4)) {
				this.iconEffectObj.hide()
			} else {
				if (this.iconEffectVisible) {
					this.iconEffectObj.show(this.wid, this.hei)
				}
			}
		}
	};
	s7sdk.image.ZoomView.prototype.resize = function(c, a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.resize - width: %0, height: %1", c, a);
		if (c == this.wid && a == this.hei) {
			return
		}
		this.wid = c;
		this.hei = a;
		this.devicePixelRatio = s7sdk.Util.adjustDevicePixelRatio(
				this.enableHD.maxHdPixels, this.hei, this.wid);
		this.outWidth = this.wid * this.devicePixelRatio;
		this.outHeight = this.hei * this.devicePixelRatio;
		this.obj.style.width = this.wid + "px";
		this.obj.style.height = this.hei + "px";
		this.displ.resize(this.outWidth, this.outHeight, c, a,
				this.devicePixelRatio);
		if (this.ovrl) {
			this.ovrl.style.width = this.wid + "px";
			this.ovrl.style.height = this.hei + "px"
		}
		if (!this.displ.view && this.view) {
			this.view.resize(c * this.devicePixelRatio, a
					* this.devicePixelRatio)
		}
		if (this.animate) {
			this.container3.style.left = -(this.wid + this.spacing) + "px";
			this.container3.style.width = 3 * (this.wid + this.spacing) + "px";
			this.container3.style.height = this.hei + "px";
			this.left.resize(this.outWidth, this.outHeight, c, a,
					this.devicePixelRatio);
			this.right.resize(this.outWidth, this.outHeight, c, a,
					this.devicePixelRatio)
		} else {
			this.container3.style.left = 0 + "px";
			this.container3.style.width = this.wid + "px";
			this.container3.style.height = this.hei + "px"
		}
		if (s7sdk.browser.device.name == "android"
				&& s7sdk.browser.device.version == "4") {
			this.container3.style.display = "none";
			var b = this.container3.offsetWidth;
			this.container3.style.display = "block"
		}
		if (this.iconEffectObj.enabled) {
			this.iconEffectObj.centerOverlay(c, a)
		}
		this.dispatchEvent(new s7sdk.event.ResizeEvent(
				s7sdk.event.ResizeEvent.COMPONENT_RESIZE, c, a, false));
		s7sdk.UIComponent.prototype.resize.apply(this, [ c, a ])
	};
	s7sdk.image.ZoomView.prototype.forceDraw = function(b, c) {
		this.container3.style[b] = c;
		if (s7sdk.browser.device.name == "android"
				&& s7sdk.browser.device.version == "4") {
			this.container3.style.display = "none";
			var a = this.container3.offsetWidth;
			this.container3.style.display = "block"
		}
	};
	s7sdk.image.ZoomView.prototype.animationStart = function() {
		if (this.frametransition.transition == "fade") {
			if (this.animate.direction) {
				this.setOpacity(this.left.displayElement, 0);
				this.left.changePosition(true)
			} else {
				this.setOpacity(this.right.displayElement, 0);
				this.right.changePosition(true)
			}
			if (s7sdk.browser.device.name == "android"
					&& s7sdk.browser.device.version == "4") {
				this.container3.style.display = "none";
				var a = this.container3.offsetWidth;
				this.container3.style.display = "block"
			}
		}
	};
	s7sdk.image.ZoomView.prototype.animationStep = function(d, e, a) {
		if (this.frametransition.transition == "slide") {
			var b = (a ? (e ? -(this.wid + this.spacing)
					: (this.wid + this.spacing)) : 0)
					- (this.wid + this.spacing) * (1 + (e ? -1 : 1) * d) + "px";
			this.forceDraw("left", b)
		} else {
			this.setOpacity(this.displ.displayElement, 1 - d);
			this.setOpacity(e ? this.left.displayElement
					: this.right.displayElement, d);
			if (s7sdk.browser.device.name == "android"
					&& s7sdk.browser.device.version == "4") {
				this.container3.style.display = "none";
				var c = this.container3.offsetWidth;
				this.container3.style.display = "block"
			}
		}
	};
	s7sdk.image.ZoomView.prototype.setOpacity = function(b, a) {
		if (s7sdk.browser.name == "ie") {
			if ((s7sdk.browser.version.minor > 5.5)
					&& (s7sdk.browser.version.minor <= 8)
					&& (document.body.filters)) {
				b.style.filter = "alpha(opacity =" + (a * 100) + ")"
			} else {
				b.style.opacity = a
			}
		} else {
			b.style.opacity = a
		}
	};
	s7sdk.image.ZoomView.prototype.animationStop = function(c, e, d, b) {
		if (d) {
			if (b) {
				this.finalizeReplace(this.right, this.left, e, true);
				var a = Math.min(Math.max(0, c - 1),
						this.mediaSet.items.length - 1);
				this.createViewExt(this.mediaSet.items[a], this.left)
			} else {
				this.finalizeReplace(this.left, this.right, e, false);
				var a = Math.min(Math.max(0, c - 1),
						this.mediaSet.items.length - 1);
				this.createViewExt(this.mediaSet.items[a], this.left)
			}
			this.forceDraw("left", -(this.wid + this.spacing) + "px");
			this.container3.relativePos = 0;
			this.checkAssetChanged(c);
			return
		}
		if (this.animate.reverse) {
			this.animate.reverse = false;
			this.animate.custom = false;
			this.forceDraw("left", -(this.wid + this.spacing) + "px");
			this.container3.relativePos = 0;
			this.checkAssetChanged(c);
			return
		}
		if (!this.animate.custom) {
			this.replaceFrame(true, c, e);
			this.forceDraw("left", -(this.wid + this.spacing) + "px")
		} else {
			this.animate.custom = false;
			this.replaceFrame(false, c, e)
		}
		this.container3.relativePos = 0;
		this.checkAssetChanged(c)
	};
	s7sdk.image.ZoomView.prototype.checkAssetChanged = function(a) {
		if (typeof (a) != "undefined") {
			var c = this.mediaSet.items[a];
			if (this.prevFrame.idx != a
					|| this.prevFrame.setname != c.parent.name) {
				this.prevFrame.idx = a;
				this.prevFrame.setname = c.parent.name;
				var b = new s7sdk.AssetEvent(
						s7sdk.event.AssetEvent.ASSET_CHANGED, c, a, true);
				this.dispatchEvent(b)
			}
		}
	};
	s7sdk.image.ZoomView.prototype.replaceFrame = function(a, b, c) {
		if (a) {
			if (b < c || c == (this.mediaSet.items.length - 1)) {
				this.finalizeReplace(this.left, this.right, c)
			} else {
				this.finalizeReplace(this.right, this.left, c)
			}
		}
		this.item = this.mediaSet.items[b]
	};
	s7sdk.image.ZoomView.prototype.finalizeReplace = function(a, c, d, b) {
		if (!this.view) {
			return
		}
		this.view.detach();
		if (a.view) {
			a.view.detach();
			a.view.unload(1 | 8)
		}
		a.view = this.view;
		a.view.viewParent = a;
		a.view.attach(a);
		a.view.draw();
		c.view.detach();
		this.view = c.view;
		this.view.viewParent = this;
		this.view.attach(this);
		this.view.draw();
		this.viewStateChange(this.view.state);
		c.view = null;
		this.createViewExt(this.mediaSet.items[d], b ? a : c);
		if (this.frametransition.transition == "fade") {
			this.setOpacity(this.displ.displayElement, 1);
			this.right.changePosition(false);
			this.left.changePosition(false)
		}
	};
	s7sdk.image.ZoomView.prototype.startMoveCtnr3 = function(b, a) {
		if (!this.animate) {
			return
		}
		this.animate.inTransition = false;
		this.animate.stop();
		this.container3.relativePos = parseInt(this.container3.style.left)
				+ (this.wid + this.spacing)
	};
	s7sdk.image.ZoomView.prototype.touchCancelCtnr3 = function(a) {
		if (this.animate && this.container3.relativePos != 0
				&& !this.animate.inTransition) {
			this.finalizeMoveCtnr3(0, 0)
		}
	};
	s7sdk.image.ZoomView.prototype.doMoveCtnr3 = function(b, a) {
		if (!this.animate) {
			return
		}
		var c = this.getIndexFromItem(this.item);
		this.container3.relativePos += b;
		if (c == 0 && this.container3.relativePos > 0) {
			this.container3.relativePos = 0
		} else {
			if (c == (this.mediaSet.items.length - 1)
					&& this.container3.relativePos < 0) {
				this.container3.relativePos = 0
			}
		}
		if (Math.abs(this.container3.relativePos) > (this.wid + this.spacing)) {
			this.container3.relativePos = this.container3.relativePos > 0 ? (this.wid + this.spacing)
					: -(this.wid + this.spacing)
		}
		var d = this;
		setTimeout(function() {
			d.forceDraw("left",
					(-(d.wid + d.spacing) + d.container3.relativePos) + "px")
		}, 0)
	};
	s7sdk.image.ZoomView.prototype.finalizeMoveCtnr3 = function(h, f) {
		var b;
		var g;
		var a = 0.5;
		var i = Math.abs(this.container3.relativePos)
				/ (this.wid + this.spacing);
		var d = this.getIndexFromItem(this.item);
		var c = this.container3.relativePos > 0;
		var e = i > a;
		if (e) {
			if (c) {
				b = d - 2;
				g = d - 1
			} else {
				b = d + 2;
				g = d + 1
			}
			b = Math.min(Math.max(0, b), this.mediaSet.items.length - 1);
			g = Math.min(Math.max(0, g), this.mediaSet.items.length - 1);
			this.animate.start(c, i, !e, g, b);
			this.animate.custom = false
		} else {
			i = Math.abs((this.wid + this.spacing)
					- Math.abs(this.container3.relativePos))
					/ (this.wid + this.spacing);
			this.animate.start(!c, i, !e);
			this.animate.custom = false
		}
	};
	s7sdk.image.ZoomView.prototype.onSwipeRight = function() {
		var c = this.getIndexFromItem(this.item);
		var b = Math.min(Math.max(0, c + 1), this.mediaSet.items.length - 1);
		if (!this.animate || this.frametransition.transition != "slide") {
			this.selectItemByIndex(b)
		} else {
			if (c == (this.mediaSet.items.length - 1)) {
				return
			}
			var d = Math
					.min(Math.max(0, c + 2), this.mediaSet.items.length - 1);
			this.animate.inTransition = false;
			this.animate.stop();
			this.container3.relativePos = parseInt(this.container3.style.left)
					+ (this.wid + this.spacing);
			var a = Math.abs(this.container3.relativePos)
					/ (this.wid + this.spacing);
			this.animate.start(false, a, false, b, d);
			this.animate.custom = false
		}
	};
	s7sdk.image.ZoomView.prototype.onSwipeLeft = function() {
		var c = this.getIndexFromItem(this.item);
		var b = Math.min(Math.max(0, c - 1), this.mediaSet.items.length - 1);
		if (!this.animate || this.frametransition.transition != "slide") {
			this.selectItemByIndex(b)
		} else {
			if (c == 0) {
				return
			}
			var d = Math
					.min(Math.max(0, c - 2), this.mediaSet.items.length - 1);
			this.animate.inTransition = false;
			this.animate.stop();
			this.container3.relativePos = parseInt(this.container3.style.left)
					+ (this.wid + this.spacing);
			var a = Math.abs(this.container3.relativePos)
					/ (this.wid + this.spacing);
			this.animate.start(true, a, false, b, d);
			this.animate.custom = false
		}
	};
	s7sdk.image.ZoomView.prototype.selectItemByIndex = function(a) {
		if (this.mediaSet && a >= 0 && a < this.mediaSet.items.length) {
			this.setItem(this.mediaSet.items[a])
		} else {
			throw new Error("Invalid index or media-set!")
		}
	};
	s7sdk.image.ZoomView.prototype.invalidate = function() {
	};
	s7sdk.image.ZoomView.prototype.imagePixelsToViewPoint = function(b) {
		if (this.view == null) {
			return new s7sdk.Point2D(Number.POSITIVE_INFINITY,
					Number.POSITIVE_INFINITY)
		}
		var a = this.view.imagePixelsToViewPoint(b);
		var d = new s7sdk.Point2D(0, 0);
		a.x = a.x + d.x;
		a.y = a.y + d.y;
		var c = new s7sdk.Point2D(b.x - d.x, b.y - d.y);
		return a
	};
	s7sdk.image.ZoomView.prototype.viewPointToImagePixels = function(a) {
		if (this.view == null) {
			return new s7sdk.Point2D(Number.POSITIVE_INFINITY,
					Number.POSITIVE_INFINITY)
		}
		var c = new s7sdk.Point2D(0, 0);
		var b = new s7sdk.Point2D(a.x - c.x, a.y - c.y);
		return this.view.viewPointToImagePixels(b)
	};
	s7sdk.image.ZoomView.prototype.getCapabilityState = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.image.ZoomView.getCapabilityState");
		return new s7sdk.ZoomCapabilityState(this.state)
	};
	s7sdk.ZoomView = s7sdk.image.ZoomView;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7zoomview", {
			position : "absolute",
			"background-color" : "#FFFFFF",
			"user-select" : "none",
			"-moz-user-select" : "-moz-none",
			"-webkit-user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)"
		}) + c(".s7zoomview[cursortype='default']", {
			cursor : "default"
		}) + c(".s7zoomview[cursortype='zoomin']", {
			cursor : "default"
		}) + c(".s7zoomview[cursortype='reset']", {
			cursor : "default"
		}) + c(".s7zoomview[cursortype='drag']", {
			cursor : "default"
		}) + c(".s7zoomview[cursortype='slide']", {
			cursor : "default"
		}) + c(".s7zoomview .s7iconeffect", {
			width : "120px",
			height : "120px",
			"-webkit-transform" : "translateZ(0px)",
			"background-repeat" : "no-repeat",
			"background-position" : "center"
		}) + c(".s7zoomview .s7iconeffect[media-type='standard']", {
			"background-image" : b("doubletapicon.png")
		}) + c(".s7zoomview .s7iconeffect[media-type='multitouch']", {
			"background-image" : b("zoomicon.png")
		});
		s7sdk.Util.css.addDefaultCSS(a, "ZoomView")
	})()
}
if (!s7sdk.ZoomSlide) {
	s7sdk.ZoomSlide = function(c, a, b) {
		this.maxStep = 300;
		this.transitionTime = typeof (a) == "undefined" ? 5000 : a * 1000;
		this.transitionEasing = typeof (b) == "undefined" ? s7sdk.Enum.TRANSITION_EASING.AUTO
				: b;
		this.viewParent = c;
		this.shift = 0;
		this.testTime = null;
		this.shiftTime = 0
	};
	s7sdk.ZoomSlide.prototype.onEnterFrame = function() {
		if (!this.inTransition) {
			return
		}
		var b = new Date();
		var c = b.getTime();
		var a;
		if (this.testTime == null) {
			this.testTime = c
		} else {
			this.testTime += 60
		}
		if (this.shift != 0) {
			a = this.calcStep(c);
			while (a < this.shift) {
				a = this.calcStep(c);
				this.shiftTime++;
				if (a == 0) {
					return true
				}
				if (a >= 1) {
					this.stop();
					return false
				}
			}
			this.shift = 0
		} else {
			a = this.calcStep(c)
		}
		if (a == 0) {
			return true
		}
		if (a >= 1) {
			this.stop();
			return false
		}
		if (this.viewParent != null && this.viewParent.animationStep != null) {
			this.viewParent.animationStep(a, this.direction, this.reverse)
		}
		return true
	};
	s7sdk.ZoomSlide.prototype.calcStep = function(b) {
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
			if (this.elasticZoom > 0) {
				if (this.transitionTime >= 1500) {
					a = (a * (a - 2)) * -1
				} else {
					if (this.transitionTime > 1000) {
						a = (a -= 1) * a * a + 1
					} else {
						if (this.transitionTime > 500) {
							a = ((a -= 1) * a * a * a - 1) * -1
						} else {
							a = (a -= 1) * a * a * a * a + 1
						}
					}
				}
			}
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
		this.prevStep = a;
		return a
	};
	s7sdk.ZoomSlide.prototype.start = function(g, a, b, e, c, f) {
		var d = new Date();
		this.curIdx = e;
		this.newIdx = c;
		this.shiftTime = 0;
		this.direction = g;
		this.shift = a;
		this.reverse = b;
		this.custom = false;
		this.startTime = d.getTime();
		this.prevStep = 0;
		this.isInitial = f;
		if (!this.inTransition) {
			s7sdk.Util.timeout(s7sdk.ZoomSlide.transitionHandler, 25, [ this ])
		}
		this.inTransition = true;
		if (this.viewParent != null && this.viewParent.animationStart != null) {
			this.viewParent.animationStart()
		}
	};
	s7sdk.ZoomSlide.transitionHandler = function(a) {
		var b = false;
		b = a.onEnterFrame();
		if (b) {
			s7sdk.Util.timeout(s7sdk.ZoomSlide.transitionHandler, 25, [ a ])
		}
	};
	s7sdk.ZoomSlide.prototype.stop = function() {
		if (this.inTransition) {
			this.inTransition = false;
			if (this.viewParent != null
					&& this.viewParent.animationStop != null) {
				this.viewParent.animationStop(this.curIdx, this.newIdx,
						this.isInitial, this.direction)
			}
		}
		this.isInitial = false
	}
}
if (!s7sdk.ViewWrapper) {
	s7sdk.ViewWrapper = function ViewWrapper(f, b, e, a, d, c, i, g) {
		this.parentObj = f;
		this.leftPos = c;
		this.spacing = i;
		this.w = a;
		this.obj = s7sdk.Util.createObj(null, "div", null, null);
		this.obj.style.zIndex = g;
		this.displayElement = s7sdk.View.createDisplay();
		this.displayElement.width = b;
		this.displayElement.height = e;
		this.obj.style.position = "absolute";
		this.displayElement.style.width = this.obj.style.width = a + "px";
		this.displayElement.style.height = this.obj.style.height = d + "px";
		this.obj.style.left = c * (a + i) + "px";
		this.obj.style.width = (a + i) + "px";
		this.obj.appendChild(this.displayElement);
		this.loresIsloaded = false
	};
	s7sdk.ViewWrapper.prototype.changePosition = function(a) {
		this.obj.style.left = (a ? 1 : this.leftPos) * (this.w + this.spacing)
				+ "px"
	};
	s7sdk.ViewWrapper.prototype.viewStateChange = function(a) {
	};
	s7sdk.ViewWrapper.prototype.viewInvalidate = function(a) {
	};
	s7sdk.ViewWrapper.prototype.onReadyToDislpay = function() {
		this.loresIsloaded = true;
		if (this.parentObj && this.parentObj.doInitialSlide) {
			this.parentObj.doInitialSlide()
		}
	};
	s7sdk.ViewWrapper.prototype.resize = function(c, e, b, d, a) {
		this.displayElement.width = c;
		this.displayElement.height = e;
		this.displayElement.style.width = this.obj.style.width = b + "px";
		this.displayElement.style.height = this.obj.style.height = d + "px";
		this.obj.style.left = this.leftPos * (b + this.spacing) + "px";
		this.obj.style.width = (b + this.spacing) + "px";
		this.w = b;
		if (this.view) {
			this.view.resize(b * a, d * a)
		}
	}
};