/*!************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
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
s7sdk.Util.require("s7sdk.common.IS");
s7sdk.Util.require("s7sdk.image.TileFxScl");
if (!s7sdk.FlyoutView) {
	s7sdk.FlyoutView = function FlyoutView(a) {
		this.container = a;
		this.highlightFrame = s7sdk.Util.createObj(null, "div");
		this.highlightFrame.className = "s7highlight";
		this.highlightFrame.style.position = "absolute";
		this.highlightCursor = s7sdk.Util.createObj(null, "div");
		this.highlightCursor.className = "s7cursor";
		this.highlightCursor.style.position = "absolute";
		if (this.container.highlightMode.type == "cursor") {
			this.highlightFrame.style.display = "none";
			this.highlightCursor.style.display = "block";
			if ("ontouchstart" in window) {
				s7sdk.Util.css.setCSSAttributeSelector(this.highlightCursor,
						"input", "touch")
			} else {
				s7sdk.Util.css.setCSSAttributeSelector(this.highlightCursor,
						"input", "mouse")
			}
		} else {
			this.highlightFrame.style.display = "block";
			this.highlightCursor.style.display = "none"
		}
		this.imageDiv = s7sdk.Util.createObj(null, "div");
		this.imageDiv.style.position = "absolute";
		this.imageDiv.style.overflow = "hidden";
		this.firstImage = new Image();
		this.firstImage.style.pointerEvents = "none";
		this.firstImage.style.position = "absolute";
		this.secondImage = new Image();
		this.secondImage.style.pointerEvents = "none";
		this.secondImage.style.position = "absolute";
		this.imageDiv.appendChild(this.firstImage);
		this.imageDiv.appendChild(this.secondImage);
		if (this.container.overlay) {
			this.overlay = document.createElement("div");
			this.overlay.style.position = "absolute";
			this.overlayTop = document.createElement("div");
			this.overlayLeft = document.createElement("div");
			this.overlayRight = document.createElement("div");
			this.overlayBottom = document.createElement("div");
			this.overlay.appendChild(this.overlayTop);
			this.overlay.appendChild(this.overlayLeft);
			this.overlay.appendChild(this.overlayRight);
			this.overlay.appendChild(this.overlayBottom);
			this.overlayTop.className = "s7overlay";
			this.overlayLeft.className = "s7overlay";
			this.overlayRight.className = "s7overlay";
			this.overlayBottom.className = "s7overlay";
			this.overlayTop.style.position = "absolute";
			this.overlayLeft.style.position = "absolute";
			this.overlayRight.style.position = "absolute";
			this.overlayBottom.style.position = "absolute";
			this.overlayTop.style.display = "block";
			this.overlayLeft.style.display = "block";
			this.overlayRight.style.display = "block";
			this.overlayBottom.style.display = "block";
			this.highlightFrame.style.display = "none"
		}
		this.flyoutDiv = s7sdk.Util.createObj(null, "div");
		this.flyoutDiv.className = "s7flyoutzoom";
		this.flyoutDiv.style.overflow = "hidden";
		this.flyoutDiv.style.pointerEvents = "none";
		this.flyoutDiv.style.display = "none";
		this.flyoutDisplay = s7sdk.Util.createObj(null, "div", null, null);
		this.flyoutDisplay.parentView = this;
		this.flyoutDisplay.style.position = "relative";
		this.flyoutDisplayImg = s7sdk.Util.createObj(null, "img", null, null);
		this.flyoutDisplayImg.style.position = "absolute";
		this.flyoutDisplay.appendChild(this.flyoutDisplayImg);
		this.flyoutDiv.appendChild(this.flyoutDisplay);
		this.container.obj.appendChild(this.imageDiv);
		this.container.obj.appendChild(this.flyoutDiv);
		this.animation = null;
		this.inputHandlersLoaded = false;
		this.loaded = false;
		this.infoMessage = null;
		this.firstInit = true;
		this.firstPicture = true;
		this.flyoutActive = false;
		this.flyoutActivating = false
	};
	s7sdk.FlyoutView.prototype.loadImage = function(c, i, n, o, f, j, h, k, g,
			e, d) {
		this.imageUrl = i + c;
		this.mainViewPos = n;
		this.flyoutPos = o;
		this.duration = h;
		this.preloadtiles = k;
		this.fmt = g;
		this.transparent = ((this.fmt.indexOf("png") != -1 || this.fmt
				.indexOf("gif") != -1) && (this.fmt.indexOf("-alpha") > 0)) ? true
				: false;
		this.imageModifiers = e;
		this.realHeight = n.height;
		this.realWidth = Math.round(this.container.item.width * this.realHeight
				/ this.container.item.height);
		if (this.realWidth > n.width) {
			this.realWidth = n.width;
			this.realHeight = Math.round(this.container.item.height
					* this.realWidth / this.container.item.width)
		}
		var b;
		if (this.flyoutPos.width * this.realHeight / this.flyoutPos.height < this.realWidth) {
			b = this.flyoutPos.height / this.realHeight
		} else {
			b = this.flyoutPos.width / this.realWidth
		}
		this.primaryFactor = f > b ? f : b;
		if (d > 0) {
			this.secondaryFactor = d > b ? d : b
		} else {
			this.secondaryFactor = -1
		}
		this.zoomFactor = this.primaryFactor;
		this.tiles = [];
		this.tileSwap = [];
		this.fullImageSize = null;
		this.lastCursorPoint = null;
		this.imageOffsetLeft = null;
		this.imageOffsetTop = null;
		if (!this.container.viewDivAttached) {
			this.container.container.appendChild(this.container.obj);
			this.container.viewDivAttached = true
		}
		if ("ontouchstart" in window) {
			this.cursorWidth = parseInt(s7sdk.Util.css.getCss("s7cursor",
					"width", null, "s7flyoutzoomview", this.container.obj, {
						input : "touch"
					}));
			this.cursorHeight = parseInt(s7sdk.Util.css.getCss("s7cursor",
					"height", null, "s7flyoutzoomview", this.container.obj, {
						input : "touch"
					}));
			this.cursorFadeTime = this.container.highlightMode.showtime
		} else {
			this.cursorWidth = parseInt(s7sdk.Util.css.getCss("s7cursor",
					"width", null, "s7flyoutzoomview", this.container.obj, {
						input : "mouse"
					}));
			this.cursorHeight = parseInt(s7sdk.Util.css.getCss("s7cursor",
					"height", null, "s7flyoutzoomview", this.container.obj, {
						input : "mouse"
					}));
			this.cursorFadeTime = 0
		}
		if (!s7sdk.Util.isNumber(this.cursorWidth)
				|| !s7sdk.Util.isNumber(this.cursorHeight)
				|| this.cursorWidth <= 0 || this.cursorHeight <= 0) {
		}
		if (this.firstInit) {
			s7sdk.Util.setObjSize(this.flyoutDiv, this.flyoutPos.width,
					this.flyoutPos.height);
			s7sdk.Util.setObjPos(this.flyoutDiv, this.flyoutPos.x,
					this.flyoutPos.y);
			this.flyoutDiv.width = this.flyoutPos.width;
			this.flyoutDiv.height = this.flyoutPos.height;
			s7sdk.Util.setObjSize(this.flyoutDisplay, this.flyoutPos.width,
					this.flyoutPos.height);
			this.flyoutDisplay.width = this.flyoutPos.width;
			this.flyoutDisplay.height = this.flyoutPos.height
		}
		this.highlightSize = this.calcHighlightRect();
		s7sdk.Util.setObjSize(this.highlightFrame, this.highlightSize.width,
				this.highlightSize.height);
		if (this.container.overlay) {
			if (this.container.highlightMode.type == "highlight") {
				this.layoutOverlay(this.highlightSize)
			} else {
				var m = new s7sdk.Rectangle(0, 0, this.cursorWidth,
						this.cursorHeight);
				this.layoutOverlay(m)
			}
		}
		if (!this.animation) {
			switch (j) {
			case s7sdk.image.FlyoutZoomView.ANIM_SLIDE:
				this.animation = new s7sdk.FlyoutView.Slide(this.flyoutDiv,
						this.duration, true, this);
				break;
			case s7sdk.image.FlyoutZoomView.ANIM_FADE:
				this.animation = new s7sdk.FlyoutView.Fade(this.flyoutDiv,
						this.duration, true, this);
				break;
			case s7sdk.image.FlyoutZoomView.ANIM_NONE:
				this.animation = new s7sdk.FlyoutView.Fade(this.flyoutDiv,
						this.duration, true, this);
				break
			}
		}
		var l = new String(this.imageUrl);
		l += (l.indexOf("?") == -1) ? "?" : "&";
		l += "fmt=";
		l += this.fmt;
		l += "&fit=constrain,1&wid=" + this.realWidth + "&hei="
				+ this.realHeight;
		l += (this.imageModifiers != null && this.imageModifiers != "") ? "&"
				+ this.imageModifiers : "";
		var a = this;
		this.image = new Image();
		this.image.style.pointerEvents = "none";
		this.image.onload = function(p) {
			var p = p || window.event;
			if (a.firstPicture) {
				a.firstImage.src = this.src;
				s7sdk.Util.setObjSize(a.firstImage, a.realWidth, a.realHeight);
				a.firstPicture = false
			} else {
				a.secondImage.src = this.src;
				s7sdk.Util.setObjSize(a.secondImage, a.realWidth, a.realHeight);
				a.firstPicture = true
			}
			a.flyoutDisplayImg.src = this.src;
			a.completeHandler(p)
		};
		this.image.onerror = function(p) {
			var p = p || window.event;
			a.errorHandler(p)
		};
		this.imageOffsetLeft = this.mainViewPos.x
				+ Math.round((this.mainViewPos.width - this.realWidth) / 2);
		this.imageOffsetTop = this.mainViewPos.y
				+ Math.round((this.mainViewPos.height - this.realHeight) / 2);
		this.image.src = l;
		this.currentZoomRect = null
	};
	s7sdk.FlyoutView.prototype.completeHandler = function(b) {
		var b = b || window.event;
		s7sdk.Util.setObjPos(this.container.obj, this.imageOffsetLeft,
				this.imageOffsetTop);
		s7sdk.Util.setObjSize(this.container.obj, this.realWidth,
				this.realHeight);
		s7sdk.Util.setObjSize(this.imageDiv, this.realWidth, this.realHeight);
		if (this.animation) {
			this.animation.reset()
		}
		if (this.container.frameTransition.transition == "fade") {
			this.swapImage(true, this.container.frameTransition.duration)
		} else {
			this.swapImage(false, this.container.frameTransition.duration)
		}
		s7sdk.Util.setObjPos(this.flyoutDiv, this.flyoutPos.x
				- this.imageOffsetLeft, this.flyoutPos.y - this.imageOffsetTop);
		if (this.container.viewDivAttached) {
			if (this.infoMessage) {
				if (this.infoMessage.tip.duration != -1) {
					this.infoMessage.hide()
				}
				this.infoMessage.show(this.realWidth, this.realHeight);
				var c = this.infoMessage;
				if (c.tip.duration != -1) {
					if (this.infoMessage.displayTimeoutId) {
						clearTimeout(this.infoMessage.displayTimeoutId);
						this.infoMessage.displayTimeoutId = null
					}
					this.infoMessage.displayTimeoutId = setTimeout(function() {
						c.hide()
					}, c.tip.duration * 1000)
				}
			}
		}
		if (!this.firstPicture) {
			this.refImageSize = new s7sdk.Rectangle(0, 0,
					this.firstImage.width, this.firstImage.height)
		} else {
			this.refImageSize = new s7sdk.Rectangle(0, 0,
					this.secondImage.width, this.secondImage.height)
		}
		this.highlightSize = this.calcHighlightRect();
		s7sdk.Util.setObjSize(this.highlightFrame, this.highlightSize.width,
				this.highlightSize.height);
		if (this.container.overlay) {
			if (this.container.highlightMode.type == "highlight") {
				this.layoutOverlay(this.highlightSize)
			} else {
				var a = new s7sdk.Rectangle(0, 0, this.cursorWidth,
						this.cursorHeight);
				this.layoutOverlay(a)
			}
		}
		this.processZoomFactor();
		if (this.preloadtiles) {
			this.copyTiles(new s7sdk.Rectangle(0, 0, this.fullImageSize.width,
					this.fullImageSize.height))
		}
		if (!this.inputHandlersLoaded) {
			this.loadHandlers();
			this.inputHandlersLoaded = true
		}
		this.firstInit = false;
		this.loaded = true
	};
	s7sdk.FlyoutView.prototype.loadHandlers = function() {
		var a = this;
		s7sdk.Event.addDOMListener(this.container.obj, "mouseover",
				function(b) {
					a.mouseOverHandler(b, a.container.obj)
				}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "mouseout", function(b) {
			a.mouseOutHandler(b, a.container.obj)
		}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "mousemove",
				function(b) {
					a.mouseMoveHandler(b, a.container.obj)
				}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "click", function(b) {
			a.mouseClickHandler(b)
		}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "touchstart",
				function(b) {
					a.touchStartHandler(b)
				}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "touchend", function(b) {
			a.touchEndHandler(b)
		}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "touchcancel", function(
				b) {
			a.touchEndHandler(b)
		}, false);
		s7sdk.Event.addDOMListener(this.container.obj, "touchmove",
				function(b) {
					a.touchMoveHandler(b)
				}, false)
	};
	s7sdk.FlyoutView.prototype.processZoomFactor = function() {
		var b = (this.flyoutPos.width / this.zoomFactor > this.refImageSize.width || this.flyoutPos.height
				/ this.zoomFactor > this.refImageSize.height);
		var a = (this.highlightSize.height >= this.refImageSize.height || this.highlightSize.width >= this.refImageSize.width);
		if (a) {
			var d;
			if (this.highlightSize.width / this.highlightSize.height > this.refImageSize.width
					/ this.refImageSize.height) {
				d = this.refImageSize.width / this.highlightSize.width
			} else {
				d = this.refImageSize.height / this.highlightSize.height
			}
			this.highlightSize = this.calcHighlightRect();
			s7sdk.Util.setObjSize(this.highlightFrame,
					this.highlightSize.width, this.highlightSize.height);
			if (this.container.overlay) {
				if (this.container.highlightMode.type == "highlight") {
					this.layoutOverlay(this.highlightSize)
				} else {
					var c = new s7sdk.Rectangle(0, 0, this.cursorWidth,
							this.cursorHeight);
					this.layoutOverlay(c)
				}
			}
		}
		if (b) {
			if (this.flyoutPos.width / this.flyoutPos.height > this.refImageSize.width
					/ this.refImageSize.height) {
				this.zoomFactor = this.flyoutPos.width
						/ this.refImageSize.width
			} else {
				this.zoomFactor = this.flyoutPos.height
						/ this.refImageSize.height
			}
		}
		this.fullImageSize = new s7sdk.Rectangle(0, 0, Math
				.round(this.refImageSize.width * this.zoomFactor), Math
				.round(this.refImageSize.height * this.zoomFactor))
	};
	s7sdk.FlyoutView.prototype.toggleZoomFactor = function(d, b) {
		if (!this.secondImage || !this.firstImage || !this.loaded) {
			return
		}
		this.zoomFactor = (this.zoomFactor == this.primaryFactor) ? this.secondaryFactor
				: this.primaryFactor;
		var a = this.tiles;
		this.tiles = this.tileSwap;
		this.tileSwap = a;
		this.highlightSize = this.calcHighlightRect();
		s7sdk.Util.setObjSize(this.highlightFrame, this.highlightSize.width,
				this.highlightSize.height);
		if (this.container.overlay) {
			if (this.container.highlightMode.type == "highlight") {
				this.layoutOverlay(this.highlightSize)
			} else {
				var c = new s7sdk.Rectangle(0, 0, this.cursorWidth,
						this.cursorHeight);
				this.layoutOverlay(c)
			}
		}
		this.processZoomFactor();
		this.lastCursorPoint = null;
		this.moveZoomViewPort(d, b);
		if (this.preloadtiles) {
			this.copyTiles(new s7sdk.Rectangle(0, 0, this.fullImageSize.width,
					this.fullImageSize.height))
		}
		this.invalidate()
	};
	s7sdk.FlyoutView.prototype.getTileUrl = function() {
		var b, a;
		a = new String(this.imageUrl);
		a += (a.indexOf("?") == -1) ? "?" : "&";
		if (!this.refImageSize) {
			return null
		}
		b = this.container.item.height
				/ (this.refImageSize.height * this.zoomFactor);
		return a + "scl=" + b
	};
	s7sdk.FlyoutView.prototype.highlightState = function(a) {
		if (a && !this.highlightActive) {
			if (this.container.overlay) {
				this.imageDiv.appendChild(this.overlay)
			}
			if (this.container.highlightMode.type == "cursor") {
				this.imageDiv.appendChild(this.highlightCursor)
			} else {
				if (this.container.highlightMode.type == "highlight") {
					this.imageDiv.appendChild(this.highlightFrame)
				}
			}
			this.highlightActive = true
		} else {
			if (!a && this.highlightActive) {
				if (this.container.overlay) {
					this.imageDiv.removeChild(this.overlay)
				}
				if (this.container.highlightMode.type == "cursor") {
					this.imageDiv.removeChild(this.highlightCursor)
				} else {
					if (this.container.highlightMode.type == "highlight") {
						this.imageDiv.removeChild(this.highlightFrame)
					}
				}
				this.highlightActive = false
			}
		}
	};
	s7sdk.FlyoutView.prototype.draw = function() {
		if (this.fullImageSize == null || !this.invalid) {
			return
		}
		var f = new s7sdk.Point2D(this.highlightX + this.highlightSize.width
				/ 2, this.highlightY + this.highlightSize.height / 2);
		var e = new s7sdk.Point2D(this.refImageSize.width / 2,
				this.refImageSize.height / 2);
		var g = new s7sdk.Point2D(
				(this.highlightSize.width - this.flyoutPos.width
						/ this.zoomFactor) / 2,
				(this.highlightSize.height - this.flyoutPos.height
						/ this.zoomFactor) / 2);
		if (g.x > 0 || g.y > 0) {
			var a = f.subtract(e);
			var d = (this.refImageSize.width - this.highlightSize.width) / 2;
			var b = (this.refImageSize.height - this.highlightSize.height) / 2;
			if (g.x > 0 && d > 1) {
				f.x += (a.x / d) * g.x
			}
			if (g.y > 0 && b > 1) {
				f.y += (a.y / b) * g.y
			}
		}
		var c = new s7sdk.Rectangle(Math.round(f.x * this.zoomFactor
				- this.flyoutPos.width / 2), Math.round(f.y * this.zoomFactor
				- this.flyoutPos.height / 2), this.flyoutPos.width,
				this.flyoutPos.height);
		this.copyTiles(c);
		this.invalid = false
	};
	s7sdk.FlyoutView.prototype.copyTiles = function(p) {
		if (this.currentZoomRect && (this.currentZoomRect.equals(p))) {
			return
		}
		var j = !this.invalid;
		var a, o;
		var d = Math.max(0, Math.floor(p.x / s7sdk.TileFxScl.TILE_SIZE)
				* s7sdk.TileFxScl.TILE_SIZE);
		var c = Math.max(0, Math.floor(p.y / s7sdk.TileFxScl.TILE_SIZE)
				* s7sdk.TileFxScl.TILE_SIZE);
		var f = d;
		var e = Math.ceil(this.fullImageSize.width / s7sdk.TileFxScl.TILE_SIZE);
		var h = new s7sdk.Point2D(0, 0);
		var n = new s7sdk.Point2D(p.x < 0 ? -p.x : 0, p.y < 0 ? -p.y : 0);
		while (this.flyoutDisplay.lastChild) {
			this.flyoutDisplay.removeChild(this.flyoutDisplay.lastChild)
		}
		this.flyoutDisplayImg.style.left = -p.x + "px";
		this.flyoutDisplayImg.style.top = -p.y + "px";
		this.flyoutDisplayImg.style.width = this.fullImageSize.width + "px";
		this.flyoutDisplayImg.style.height = this.fullImageSize.height + "px";
		this.flyoutDisplay.appendChild(this.flyoutDisplayImg);
		var g, l, b, k;
		while (c < p.getBottom() && c < this.fullImageSize.height) {
			var i = new s7sdk.Rectangle(0, 0, 0, 0);
			o = c / s7sdk.TileFxScl.TILE_SIZE;
			while (d < p.getRight() && d < this.fullImageSize.width) {
				b = Math.min(this.fullImageSize.width - d,
						s7sdk.TileFxScl.TILE_SIZE);
				k = Math.min(this.fullImageSize.height - c,
						s7sdk.TileFxScl.TILE_SIZE);
				a = d / s7sdk.TileFxScl.TILE_SIZE;
				l = o * e + a;
				g = this.tiles[l];
				if (g == null) {
					g = new s7sdk.TileFxScl(
							new s7sdk.TileAddress(b, k, l, a, o), this
									.getTileUrl(), this.fmt);
					g.idx = l;
					this.tiles[l] = g
				}
				var m = new s7sdk.Rectangle(p.x - d, p.y - c, p.width, p.height);
				i = m.intersection(new s7sdk.Rectangle(0, 0, b, k));
				if (j == false && i.width > 0 && i.height > 0) {
					g.image.style.position = "absolute";
					if (s7sdk.browser.device.name == "android"
							&& s7sdk.browser.device.version == 4) {
						g.image.style.border = "1px solid transparent"
					}
					g.image.style.zoom = 1;
					g.image.style.filter = "inherit";
					g.image.style.filter = this.flyoutDiv.style.filter;
					g.image.style.left = -i.x + h.x + n.x + "px";
					g.image.style.top = -i.y + h.y + n.y + "px";
					this.flyoutDisplay.appendChild(g.image)
				}
				h.x += i.width;
				d += s7sdk.TileFxScl.TILE_SIZE
			}
			h.x = 0;
			h.y += i.height;
			d = f;
			c += s7sdk.TileFxScl.TILE_SIZE
		}
		this.currentZoomRect = p
	};
	s7sdk.FlyoutView.prototype.moveZoomViewPort = function(b, f) {
		if (!this.lastCursorPoint) {
			this.lastCursorPoint = new s7sdk.Point2D(b, f)
		} else {
			if (this.lastCursorPoint.x == b && this.lastCursorPoint.y == f) {
				return
			}
			this.lastCursorPoint.x = b;
			this.lastCursorPoint.y = f
		}
		var e = b - Math.round(this.highlightSize.width / 2);
		var d = f - Math.round(this.highlightSize.height / 2);
		e = Math.min(e, Math.round(this.refImageSize.width
				- this.highlightSize.width - 1));
		d = Math.min(d, Math.round(this.refImageSize.height
				- this.highlightSize.height - 1));
		e = Math.max(e, 0);
		d = Math.max(d, 0);
		this.highlightX = e;
		this.highlightY = d;
		s7sdk.Util.setObjPos(this.highlightFrame, this.highlightX,
				this.highlightY);
		var c = 0;
		var a = 0;
		if ("ontouchstart" in window) {
			c = Math.max(Math.min(b - Math.round(this.cursorWidth / 2), Math
					.round(this.refImageSize.width - this.cursorWidth - 1)), 0);
			a = Math.max(Math.min(f - Math.round(this.cursorHeight), Math
					.round(this.refImageSize.height - this.cursorHeight - 1)),
					0)
		} else {
			c = Math.max(Math.min(b - Math.round(this.cursorWidth / 2), Math
					.round(this.refImageSize.width - this.cursorWidth - 1)), 0);
			a = Math.max(Math.min(f - Math.round(this.cursorHeight / 2), Math
					.round(this.refImageSize.height - this.cursorHeight - 1)),
					0)
		}
		s7sdk.Util.setObjPos(this.highlightCursor, c, a);
		if (this.container.overlay) {
			if (this.container.highlightMode.type == "highlight") {
				s7sdk.Util.setObjPos(this.overlay, this.highlightX,
						this.highlightY)
			} else {
				s7sdk.Util.setObjPos(this.overlay, c, a)
			}
			this.overlay.style.display = "none";
			this.overlay.offsetWidth;
			this.overlay.style.display = "block"
		}
		this.invalidate()
	};
	s7sdk.FlyoutView.checkTarget = function(a, b) {
		while (a && a.parentNode) {
			if (a == b) {
				return true
			}
			a = a.parentNode
		}
		return false
	};
	s7sdk.FlyoutView.prototype.mouseOverHandler = function(e, d) {
		s7sdk.Event.preventDefault(e);
		var a = e.relatedTarget || e.fromElement;
		if (s7sdk.FlyoutView.checkTarget(a, d)) {
			return
		}
		if (this.infoMessage) {
			if (this.infoMessage.tip.duration != -1) {
				this.infoMessage.hide()
			}
		}
		var c = s7sdk.Util.getEventPos(e).x
				- s7sdk.Util.getObjPos(this.imageDiv).x;
		var b = s7sdk.Util.getEventPos(e).y
				- s7sdk.Util.getObjPos(this.imageDiv).y;
		if ((c > this.realWidth) || (b > this.realHeight) || (c < 0) || (b < 0)) {
			return
		}
		this.highlightState(true);
		this.activateFlyout();
		this.moveZoomViewPort(c, b)
	};
	s7sdk.FlyoutView.prototype.mouseMoveHandler = function(d, c) {
		s7sdk.Event.preventDefault(d);
		var b = s7sdk.Util.getEventPos(d).x
				- s7sdk.Util.getObjPos(this.imageDiv).x;
		var a = s7sdk.Util.getEventPos(d).y
				- s7sdk.Util.getObjPos(this.imageDiv).y;
		if ((b > this.realWidth) || (a > this.realHeight) || (b < 0) || (a < 0)) {
			this.highlightState(false);
			this.stopHandler(d);
			return
		}
		this.highlightState(true);
		this.activateFlyout();
		this.moveZoomViewPort(b, a)
	};
	s7sdk.FlyoutView.prototype.mouseOutHandler = function(e, d) {
		s7sdk.Event.preventDefault(e);
		var a = e.relatedTarget || e.toElement;
		if (s7sdk.FlyoutView.checkTarget(a, d)) {
			return
		}
		var c = s7sdk.Util.getEventPos(e).x
				- s7sdk.Util.getObjPos(this.imageDiv).x;
		var b = s7sdk.Util.getEventPos(e).y
				- s7sdk.Util.getObjPos(this.imageDiv).y;
		if ((c > this.realWidth) || (b > this.realHeight) || (c < 0) || (b < 0)) {
			this.highlightState(false);
			this.stopHandler(e);
			return
		}
		this.highlightState(false);
		this.stopHandler(e)
	};
	s7sdk.FlyoutView.prototype.stopHandler = function(a) {
		this.deactivateFlyout()
	};
	s7sdk.FlyoutView.prototype.touchStartHandler = function(c) {
		s7sdk.Event.preventDefault(c);
		this.highlightState(true);
		var b, a;
		if (this.infoMessage) {
			if (this.infoMessage.tip.duration != -1) {
				this.infoMessage.hide()
			}
		}
		this.startHandlerTime = c.timeStamp;
		this.activateFlyout();
		if (c.touches.length > 0) {
			b = s7sdk.Util.getEventPos(c).x
					- s7sdk.Util.getObjPos(this.imageDiv).x;
			a = s7sdk.Util.getEventPos(c).y
					- s7sdk.Util.getObjPos(this.imageDiv).y;
			this.moveZoomViewPort(b, a)
		}
	};
	s7sdk.FlyoutView.prototype.touchMoveHandler = function(c) {
		s7sdk.Event.preventDefault(c);
		var b = s7sdk.Util.getEventPos(c).x
				- s7sdk.Util.getObjPos(this.imageDiv).x;
		var a = s7sdk.Util.getEventPos(c).y
				- s7sdk.Util.getObjPos(this.imageDiv).y;
		if ((b > this.realWidth) || (a > this.realHeight) || (b < 0) || (a < 0)) {
			this.highlightState(false);
			this.stopHandler(c);
			return
		}
		this.moveZoomViewPort(b, a)
	};
	s7sdk.FlyoutView.prototype.touchEndHandler = function(c) {
		s7sdk.Event.preventDefault(c);
		var b, a;
		this.stopHandler(c);
		if (c.timeStamp - this.startHandlerTime < 250) {
			this.startHandlerTime = 0;
			if (c.hasOwnProperty("touches") && c.touches.length > 0) {
				b = s7sdk.Util.getEventPos(c).x
						- s7sdk.Util.getObjPos(this.imageDiv).x;
				a = s7sdk.Util.getEventPos(c).y
						- s7sdk.Util.getObjPos(this.imageDiv).y
			} else {
				b = this.lastCursorPoint.x;
				a = this.lastCursorPoint.y
			}
			this.click(b, a)
		}
		this.highlightState(false)
	};
	s7sdk.FlyoutView.prototype.mouseClickHandler = function(c) {
		s7sdk.Event.preventDefault(c);
		var b = s7sdk.Util.getEventPos(c).x
				- s7sdk.Util.getObjPos(this.imageDiv).x;
		var a = s7sdk.Util.getEventPos(c).y
				- s7sdk.Util.getObjPos(this.imageDiv).y;
		if ((b > this.realWidth) || (a > this.realHeight) || (b < 0) || (a < 0)) {
			return
		}
		this.click(b, a)
	};
	s7sdk.FlyoutView.prototype.click = function(b, a) {
		if (this.secondaryFactor != -1) {
			this.toggleZoomFactor(b, a)
		}
		s7sdk.Event.dispatch(this.container, s7sdk.Event.CLICK, false)
	};
	s7sdk.FlyoutView.prototype.onTileLoaded = function(a) {
		this.invalidate()
	};
	s7sdk.FlyoutView.prototype.errorHandler = function(a) {
		var a = a || window.event;
		s7sdk.Logger.log(s7sdk.Logger.SEVERE, "FlyoutView.errorHandler %0",
				a.message)
	};
	s7sdk.FlyoutView.prototype.calcHighlightRect = function() {
		var a = new s7sdk.Rectangle(0, 0, this.flyoutPos.width,
				this.flyoutPos.height);
		a.width /= this.zoomFactor;
		a.height /= this.zoomFactor;
		return a
	};
	s7sdk.FlyoutView.prototype.layoutOverlay = function(a) {
		this.overlayTop.style.top = -(this.realHeight - a.height) + "px";
		this.overlayTop.style.left = -(this.realWidth - a.width) + "px";
		this.overlayTop.style.width = (2 * this.realWidth - a.width) + "px";
		this.overlayTop.style.height = (this.realHeight - a.height) + "px";
		this.overlayLeft.style.top = "0px";
		this.overlayLeft.style.left = -(this.realWidth - a.width) + "px";
		this.overlayLeft.style.width = (this.realWidth - a.width) + "px";
		this.overlayLeft.style.height = a.height + "px";
		this.overlayRight.style.top = "0px";
		this.overlayRight.style.left = a.width + "px";
		this.overlayRight.style.width = (this.realWidth - a.width) + "px";
		this.overlayRight.style.height = a.height + "px";
		this.overlayBottom.style.top = a.height + "px";
		this.overlayBottom.style.left = -(this.realWidth - a.width) + "px";
		this.overlayBottom.style.width = (2 * this.realWidth - a.width) + "px";
		this.overlayBottom.style.height = (this.realHeight - a.height) + "px"
	};
	s7sdk.FlyoutView.prototype.activateFlyout = function() {
		if (!this.flyoutActive) {
			this.flyoutActive = true;
			var f = this;
			function c() {
				if (f.flyoutActive) {
					if (f.animation) {
						f.animation
								.show(
										function() {
											if (!f.flyoutActivating) {
												s7sdk.Logger
														.log(
																s7sdk.Logger.FINER,
																"FlyoutView.animationStart");
												var h = new s7sdk.event.FlyoutEvent(
														s7sdk.event.FlyoutEvent.NOTF_FLYOUT_SHOW_START,
														true);
												f.container.dispatchEvent(h,
														false)
											}
										}, function() {
										})
					} else {
						f.flyoutDiv.style.display = "block"
					}
				}
			}
			function b(o, l, k, n, m, h) {
				var j = (new Date()).getTime();
				var i = n + (m - n) * (j - k) / (l * 1000);
				if ((j - k) >= (l * 1000)) {
					if (i >= 1) {
						if (o.filters) {
							o.style.filter = ""
						}
					}
					s7sdk.Util.setOpacity(o, m);
					window.clearTimeout(o.timerOpacity);
					o.timerOpacity = null;
					if (typeof h == "function") {
						h(arguments.callee)
					}
					return
				} else {
					s7sdk.Util.setOpacity(o, i);
					o.timerOpacity = window.setTimeout(function() {
						b(o, l, k, n, m, h)
					}, 10)
				}
			}
			if ("ontouchstart" in window) {
				if (this.container.overlay) {
					var e = s7sdk.Util.css.getCss("s7overlay", "opacity", null,
							"s7flyoutzoomview", this.container.obj);
					if (this.overlay.timerOpacity) {
						window.clearTimeout(this.overlay.timerOpacity);
						this.overlay.timerOpacity = null
					}
					var g = (new Date()).getTime();
					b(this.overlay, this.cursorFadeTime, g, 0, e)
				}
				if (this.container.highlightMode.type == "cursor") {
					var d = s7sdk.Util.css.getCss("s7cursor", "opacity", null,
							"s7flyoutzoomview", this.container.obj, {
								input : "touch"
							});
					if (this.highlightCursor.timerOpacity) {
						window.clearTimeout(this.highlightCursor.timerOpacity);
						this.highlightCursor.timerOpacity = null
					}
					var g = (new Date()).getTime();
					s7sdk.Util.setOpacity(this.highlightCursor, 0);
					this.highlightCursor.style.display = "block";
					b(this.highlightCursor, this.cursorFadeTime, g, 0, d, c)
				} else {
					if (this.container.highlightMode.type == "highlight") {
						var a = s7sdk.Util.css.getCss("s7highlight", "opacity",
								null, "s7flyoutzoomview", this.container.obj);
						if (this.highlightFrame.timerOpacity) {
							window
									.clearTimeout(this.highlightFrame.timerOpacity);
							this.highlightFrame.timerOpacity = null
						}
						var g = (new Date()).getTime();
						s7sdk.Util.setOpacity(this.highlightFrame, 0);
						this.highlightFrame.style.display = "block";
						b(this.highlightFrame, this.cursorFadeTime, g, 0, a, c)
					}
				}
			} else {
				c()
			}
			this.flyoutActivating = true;
			this.invalidate()
		}
	};
	s7sdk.FlyoutView.prototype.deactivateFlyout = function() {
		if (this.flyoutActive) {
			this.flyoutActive = false;
			if (this.animation) {
				this.animation
						.hide(
								function() {
								},
								function() {
									if (!this.flyoutActive) {
										this.flyoutDiv.style.display = "none"
									}
									this.flyoutActivating = false;
									s7sdk.Logger.log(s7sdk.Logger.FINER,
											"FlyoutView.animationComplete");
									var a = new s7sdk.event.FlyoutEvent(
											s7sdk.event.FlyoutEvent.NOTF_FLYOUT_HIDE_END,
											true);
									this.container.dispatchEvent(a, false)
								})
			} else {
				this.flyoutDiv.style.display = "none"
			}
		}
	};
	s7sdk.FlyoutView.prototype.invalidate = function() {
		this.invalid = true;
		this.draw()
	};
	s7sdk.FlyoutView.Fade = function Fade(b, c, d, a) {
		this.element = b;
		this.currentState = d ? 0 : 1;
		this.duration = c;
		this.hiddenState = d;
		this.currentCallback = null;
		this.callbackContext = a;
		this.start = null;
		this.timer = null
	};
	s7sdk.FlyoutView.Fade.prototype.show = function(c, d) {
		this.start = new Date().getTime() + this.duration.showDelay * 1000;
		var b = this;
		var e = this.currentCallback = a;
		if (!this.hiddenState) {
			return
		}
		this.hiddenState = false;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		function a() {
			if (e !== this.currentCallback) {
				return
			}
			var f = (new Date - this.start)
					/ (this.duration.showTime * 1000 + 1)
					* (1 / this.duration.showTime + 0.001);
			var j = (f < 1) ? (1 - this.currentState) * f + this.currentState
					: 1;
			if (f >= 0) {
				this.element.style.display = "block";
				this.currentState = j
			} else {
				j = this.currentState
			}
			this.element.style.opacity = j;
			this.element.style.zoom = 1;
			var k = s7sdk.browser && s7sdk.browser.name == "ie"
					&& s7sdk.browser.version.major <= 8;
			if (k && this.callbackContext.transparent) {
				this.element.style.visibility = "hidden"
			} else {
				this.element.style.filter = "alpha(opacity =" + (j * 100) + ")";
				var h = this.element.getElementsByTagName("*");
				for ( var g = 0; g < h.length; g++) {
					h[g].style.filter = "alpha(opacity =" + (j * 100) + ")"
				}
			}
			this.currentState = j;
			if ((f < 1) && !this.hiddenState) {
				this.currentCallback = a;
				this.timer = setTimeout(function() {
					a.apply(b, [])
				}, 25)
			} else {
				if (k && this.callbackContext.transparent) {
					this.element.style.visibility = "visible"
				}
				if (d) {
					d.apply(this.callbackContext, [])
				}
			}
		}
		if (c) {
			c.apply(this.callbackContext, [])
		}
		a.apply(b, [])
	};
	s7sdk.FlyoutView.Fade.prototype.hide = function(b, d) {
		this.start = new Date().getTime() + this.duration.hideDelay * 1000;
		var a = this;
		var e = this.currentCallback = c;
		if (this.hiddenState) {
			return
		}
		this.hiddenState = true;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		function c() {
			if (e !== this.currentCallback) {
				return
			}
			var f = (new Date - this.start)
					/ (this.duration.hideTime * 1000 + 1)
					* (1 / this.duration.hideTime + 0.001);
			var j = (f < 1) ? (0 - this.currentState) * f + this.currentState
					: 0;
			if (f >= 0) {
				this.element.style.display = "block";
				this.currentState = j
			} else {
				j = this.currentState
			}
			this.element.style.opacity = j;
			this.element.style.zoom = 1;
			var k = s7sdk.browser && s7sdk.browser.name == "ie"
					&& s7sdk.browser.version.major <= 8;
			if (k && this.callbackContext.transparent) {
				this.element.style.visibility = "visible"
			} else {
				this.element.style.filter = "alpha(opacity =" + (j * 100) + ")";
				var h = this.element.getElementsByTagName("*");
				for ( var g = 0; g < h.length; g++) {
					h[g].style.filter = "alpha(opacity =" + (j * 100) + ")"
				}
			}
			this.currentState = j;
			if ((f < 1) && this.hiddenState) {
				this.currentCallback = c;
				this.timer = setTimeout(function() {
					c.apply(a, [])
				}, 25)
			} else {
				if (k && this.callbackContext.transparent) {
					this.element.style.visibility = "hidden"
				}
				if (d) {
					d.apply(this.callbackContext, [])
				}
			}
		}
		if (b) {
			b.apply(this.callbackContext, [])
		}
		c.apply(a, [])
	};
	s7sdk.FlyoutView.Fade.prototype.reset = function(c) {
		this.hiddenState = true;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		this.element.style.opacity = 0;
		this.currentState = 0;
		var d = s7sdk.browser && s7sdk.browser.name == "ie"
				&& s7sdk.browser.version.major <= 8;
		if (d && this.callbackContext.transparent) {
			this.element.style.visibility = "hidden"
		} else {
			this.element.style.filter = "alpha(opacity =" + 0 + ")";
			var b = this.element.getElementsByTagName("*");
			for ( var a = 0; a < b.length; a++) {
				b[a].style.filter = "alpha(opacity =" + 0 + ")"
			}
		}
	};
	s7sdk.FlyoutView.Slide = function Slide(b, c, d, a) {
		this.element = b;
		this.currentState = d ? 0 : 1;
		this.elementWidth = parseFloat(b.width);
		this.duration = c;
		this.hiddenState = d;
		this.currentCallback = null;
		this.callbackContext = a;
		this.start = null;
		this.timer = null
	};
	s7sdk.FlyoutView.Slide.prototype.show = function(b, d) {
		this.start = new Date().getTime() + this.duration.showDelay * 1000;
		var a = this;
		var e = this.currentCallback = c;
		if (!this.hiddenState) {
			return
		}
		this.hiddenState = false;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		function c() {
			if (e !== this.currentCallback) {
				return
			}
			var f = (new Date - this.start)
					/ (this.duration.showTime * 1000 + 1)
					* (1 / this.duration.showTime + 0.001);
			var h = (f < 1) ? (this.elementWidth - this.currentState) * f
					+ this.currentState : this.elementWidth;
			if (f >= 0) {
				this.element.style.display = "block";
				this.currentState = h
			} else {
				h = this.currentState
			}
			this.element.style.width = Math.max(0, h) + "px";
			for ( var g = 0; g < this.element.childNodes.length; g++) {
				this.element.childNodes[g].style.marginLeft = (-this.elementWidth + h)
						+ "px"
			}
			this.currentState = h;
			if ((f < 1) && !this.hiddenState) {
				this.currentCallback = c;
				this.timer = setTimeout(function() {
					c.apply(a, [])
				}, 25)
			} else {
				if (d) {
					d.apply(this.callbackContext, [])
				}
			}
		}
		if (b) {
			b.apply(this.callbackContext, [])
		}
		c.apply(a, [])
	};
	s7sdk.FlyoutView.Slide.prototype.hide = function(b, d) {
		this.start = new Date().getTime() + this.duration.hideDelay * 1000;
		var a = this;
		var e = this.currentCallback = c;
		if (this.hiddenState) {
			return
		}
		this.hiddenState = true;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		function c() {
			if (e !== this.currentCallback) {
				return
			}
			var f = (new Date - this.start)
					/ (this.duration.hideTime * 1000 + 1)
					* (1 / this.duration.hideTime + 0.001);
			var h = (f < 1) ? (0 - this.currentState) * f + this.currentState
					: 0;
			if (f >= 0) {
				this.element.style.display = "block";
				this.currentState = h
			} else {
				h = this.currentState
			}
			this.element.style.width = Math.max(0, h) + "px";
			for ( var g = 0; g < this.element.childNodes.length; g++) {
				this.element.childNodes[g].style.marginLeft = (-this.elementWidth + h)
						+ "px"
			}
			this.currentState = h;
			if ((f < 1) && this.hiddenState) {
				this.currentCallback = c;
				this.timer = setTimeout(function() {
					c.apply(a, [])
				}, 25)
			} else {
				if (d) {
					d.apply(this.callbackContext, [])
				}
			}
		}
		if (b) {
			b.apply(this.callbackContext, [])
		}
		c.apply(a, [])
	};
	s7sdk.FlyoutView.Slide.prototype.reset = function(b) {
		this.hiddenState = true;
		if (typeof this.timer != "undefined") {
			clearTimeout(this.timer);
			this.timer = null
		}
		this.element.style.width = 0 + "px";
		this.currentState = 0;
		this.element.style.display = "none";
		for ( var a = 0; a < this.element.childNodes.length; a++) {
			this.element.childNodes[a].style.marginLeft = -this.elementWidth
					+ "px"
		}
		if (b) {
			b.apply(this.callbackContext, [])
		}
	};
	s7sdk.FlyoutView.Slide.prototype.cubicEase = function(a) {
		return --a * a * a + 1
	};
	s7sdk.FlyoutView.Slide.prototype.linear = function(a) {
		return a
	};
	s7sdk.FlyoutView.Slide.prototype.quad = function(a) {
		return Math.pow(a, 2)
	};
	s7sdk.FlyoutView.Slide.prototype.root = function(a) {
		return Math.pow(a, 0.5)
	};
	s7sdk.FlyoutView.Slide.prototype.sine = function(a) {
		return 1 - Math.sin((1 - a) * Math.PI / 2)
	};
	s7sdk.FlyoutView.prototype.swapImage = function(b, c, a) {
		if (this.swapTimer) {
			window.clearTimeout(this.swapTimer);
			this.swapTimer = null
		}
		var e = (new Date()).getTime();
		function d(o, l, f, i, h, m, n, j) {
			var g = (new Date()).getTime();
			var k = m + (n - m) * (g - h) / (i * 1000);
			if ((g - h) >= (i * 1000)) {
				s7sdk.Util.setOpacity(l, n);
				s7sdk.Util.setOpacity(f, m);
				if (n > 0.99) {
					if (l.filters) {
						l.style.filter = ""
					}
				}
				window.clearTimeout(o.swapTimer);
				o.swapTimer = null;
				if (typeof j == "function") {
					j(arguments.callee)
				}
				return
			} else {
				s7sdk.Util.setOpacity(l, k);
				s7sdk.Util.setOpacity(f, 1 - k);
				o.swapTimer = window.setTimeout(function() {
					d(o, l, f, i, h, m, n, j)
				}, 10)
			}
		}
		if (!b) {
			if (!this.firstPicture) {
				this.firstImage.style.visibility = "visible";
				this.secondImage.style.visibility = "hidden"
			} else {
				this.firstImage.style.visibility = "hidden";
				this.secondImage.style.visibility = "visible"
			}
		} else {
			if (!this.firstPicture) {
				s7sdk.Util.setObjPos(this.secondImage,
						(this.firstImage.width - this.secondImage.width) / 2,
						(this.firstImage.height - this.secondImage.height) / 2);
				s7sdk.Util.setObjPos(this.firstImage, 0, 0);
				d(this, this.firstImage, this.secondImage, c, e, 0, 1)
			} else {
				s7sdk.Util.setObjPos(this.firstImage,
						(this.secondImage.width - this.firstImage.width) / 2,
						(this.secondImage.height - this.firstImage.height) / 2);
				s7sdk.Util.setObjPos(this.secondImage, 0, 0);
				d(this, this.secondImage, this.firstImage, c, e, 0, 1)
			}
		}
	}
};