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
s7sdk.Util.require("s7sdk.common.Geometry");
if (!s7sdk.Thumb) {
	s7sdk.Thumb = function(i, m, j, r, h, k, b, f, d, e, o, c, l, g, n, p, a) {
		this.serverUrl_ = m;
		this.iscommand_ = j;
		this.item = r;
		this.wid_ = h;
		this.hei_ = k;
		this.fmt_ = b;
		this.highlight_ = f;
		this.highlightColor_ = d;
		this.textPos_ = o || s7sdk.Thumb.TEXT_BOTTOM;
		this.parentClassName_ = c || "";
		this.toolTip_ = null;
		this.locale_ = l;
		this.sourceRect = e;
		this.container_ = i;
		this.x = 0;
		this.y = 0;
		this.div = null;
		this.selected_ = false;
		this.mouseOver_ = false;
		this.labelHeight_ = 0;
		this.labelWidth_ = 0;
		this.div = this.createMainDiv();
		this.imgDiv = this.createImgDiv();
		this.overlayDiv = this.createOverlayDiv();
		this.imgDiv.appendChild(this.overlayDiv);
		this.div.appendChild(this.imgDiv);
		switch (a) {
		case s7sdk.ItemDescType.IMG:
			this.overlayType = "image";
			break;
		case s7sdk.ItemDescType.IMAGE_SET:
			this.overlayType = "swatchset";
			break;
		case s7sdk.ItemDescType.SPIN_SET:
			this.overlayType = "spinset";
			break;
		case s7sdk.ItemDescType.VIDEO:
			this.overlayType = "video";
			break;
		case s7sdk.ItemDescType.VIDEO_SET:
			this.overlayType = "video";
			break;
		default:
			this.overlayType = "";
			break
		}
		this.setOverlayType(this.overlayType);
		this.isgridview = g;
		this.item_label = this.item.label ? this.item.label : n;
		if ((this.item_label && this.item_label.length)
				|| (this.item.customlabel && r.customlabel.length)) {
			this.txtDiv = this.createTxtDiv();
			if (this.textPos_ == s7sdk.Thumb.TEXT_RIGHT
					|| this.textPos_ == s7sdk.Thumb.TEXT_LEFT) {
				s7sdk.Thumb.setInlineBlock(this.imgDiv);
				s7sdk.Thumb.setInlineBlock(this.txtDiv);
				this.txtDiv.style.verticalAlign = "top"
			}
			this.txtDiv.innerHTML = this.item_label
		}
		this.layoutComp();
		s7sdk.Event.addDOMListener(this.div, "mousedown", function(s) {
			s7sdk.Event.preventDefault(s || window.event)
		}, false);
		var q = this;
		s7sdk.Event.addDOMListener(this.div, "mousemove", function(s) {
			if (!q.mouseOver_) {
				q.showOverState(true);
				q.mouseOver_ = true
			}
		}, false);
		s7sdk.Event.addDOMListener(this.div, "mouseout", function(s) {
			q.mouseOver_ = false;
			q.showOverState(false)
		}, false);
		if (this.textPos_ == s7sdk.Thumb.TEXT_TOOLTIP && this.item_label
				&& this.item_label.length) {
			this.toolTip_ = new s7sdk.SimpleToolTip(this.div, this.item_label,
					this.container_)
		}
		this.setSelected(false);
		this.delayedLoad_ = p == true;
		this.isLoading = false;
		this.isComlete = false;
		if (this.item.image != null && this.item.image != ""
				&& !this.delayedLoad_) {
			this.loadImage()
		}
	};
	s7sdk.Thumb.TEXT_BOTTOM = "bottom";
	s7sdk.Thumb.TEXT_TOP = "top";
	s7sdk.Thumb.TEXT_LEFT = "left";
	s7sdk.Thumb.TEXT_RIGHT = "right";
	s7sdk.Thumb.TEXT_NONE = "none";
	s7sdk.Thumb.TEXT_ONLY = "only";
	s7sdk.Thumb.TEXT_TOOLTIP = "tooltip";
	s7sdk.Thumb.setInlineBlock = function(a) {
		if (s7sdk.browser.name == "ie" && s7sdk.browser.version.major == "7") {
			a.style.display = "inline";
			a.style.zoom = "1"
		} else {
			a.style.display = "inline-block"
		}
	};
	s7sdk.Thumb.prototype.getWidth = function() {
		var a = this.wid_;
		if (this.getLabelEnabled()) {
			if (this.textPos_ == s7sdk.Thumb.TEXT_LEFT
					|| this.textPos_ == s7sdk.Thumb.TEXT_RIGHT) {
				if (this.isgridview) {
					a = this.labelWidth_ + this.wid_
				} else {
					a *= 2
				}
			}
		}
		return a
	};
	s7sdk.Thumb.prototype.getHeight = function() {
		var a = this.hei_;
		if (this.textPos_ == s7sdk.Thumb.TEXT_TOP
				|| this.textPos_ == s7sdk.Thumb.TEXT_BOTTOM) {
			if (this.getLabelEnabled()) {
				a += this.labelHeight_
			}
		}
		return a
	};
	s7sdk.Thumb.prototype.getLabelEnabled = function() {
		return Boolean(this.item_label && this.item_label.length)
	};
	s7sdk.Thumb.prototype.loadImage = function() {
		this.isLoading = true;
		var a = this.serverUrl_;
		if (!a.match(/\/$/)) {
			a += "/"
		}
		if (!this.item.image && this.item.color) {
			a += s7sdk.MediaSetParser.findCompanyNameInAsset(this.item.asset);
			a += "?bgc=" + this.item.color + "&"
		} else {
			a += this.item.image;
			if (a.indexOf("?") == -1) {
				a += "?"
			} else {
				a += "&layer=comp&"
			}
		}
		a += "fit=constrain,1&";
		a += "wid=" + this.wid_ + "&hei=" + this.hei_;
		a += "&fmt=" + this.fmt_;
		if (typeof (this.sourceRect) != "undefined") {
			a += "&rgn=" + this.sourceRect.x + "," + this.sourceRect.y;
			a += "," + this.sourceRect.width + "," + this.sourceRect.height
		}
		if (this.iscommand_ != null && this.iscommand_.length > 0) {
			a += (a.indexOf("?") == -1) ? "?" : "&";
			a += this.iscommand_
		}
		if (s7sdk.Util.isNonEmptyString(this.locale_)) {
			a += "&locale=" + this.locale_
		}
		s7sdk.Logger.log(s7sdk.Logger.FINER, "s7sdk.Thumb.loadImage - req: %0",
				a);
		this.image_ = new Image();
		var b = this;
		this.image_.onload = function(c) {
			b.onLoadImage()
		};
		this.image_.onerror = function(c) {
			b.onErrorImage()
		};
		this.image_.onabort = function(c) {
			b.onAbortImage()
		};
		this.image_.src = a
	};
	s7sdk.Thumb.prototype.onLoadImage = function() {
		this.imgDiv.style.backgroundImage = 'url("' + this.image_.src + '")';
		this.isComlete = true;
		this.isLoading = false
	};
	s7sdk.Thumb.prototype.onErrorImage = function() {
		this.isComlete = true;
		this.isLoading = false
	};
	s7sdk.Thumb.prototype.onAbortImage = function() {
		this.isComlete = true;
		this.isLoading = false
	};
	s7sdk.Thumb.prototype.layoutComp = function() {
		this.imgDiv.style.width = this.wid_ + "px";
		this.imgDiv.style.height = this.hei_ + "px";
		if (this.item_label && this.item_label.length) {
			this.txtDiv.style.width = this.wid_ + "px";
			this.labelHeight_ = 0;
			this.labelWidth_ = 0;
			this.container_.appendChild(this.txtDiv);
			this.labelHeight_ = this.txtDiv.clientHeight;
			this.labelWidth_ = this.txtDiv.clientWidth;
			this.container_.removeChild(this.txtDiv);
			switch (this.textPos_) {
			case s7sdk.Thumb.TEXT_RIGHT:
			case s7sdk.Thumb.TEXT_BOTTOM:
				this.div.appendChild(this.txtDiv);
				break;
			case s7sdk.Thumb.TEXT_LEFT:
			case s7sdk.Thumb.TEXT_TOP:
				this.div.insertBefore(this.txtDiv, this.imgDiv);
				break
			}
		}
	};
	s7sdk.Thumb.prototype.updatePosition = function() {
		this.div.style.left = this.x + "px";
		this.div.style.top = this.y + "px"
	};
	s7sdk.Thumb.prototype.getSelected = function() {
		return this.selected_
	};
	s7sdk.Thumb.prototype.setSelected = function(a) {
		this.selected_ = a;
		this.showHighlight(a)
	};
	s7sdk.Thumb.prototype.showHighlight = function(b) {
		s7sdk.Util.css.setCSSAttributeSelector(this.imgDiv, "state",
				b ? "selected" : "default");
		if (this.highlight_ != -1) {
			var a = b ? "inset 0 0 0px " + this.highlight_ + "px "
					+ this.highlightColor_ : "none";
			this.imgDiv.style.boxShadow = a;
			this.imgDiv.style.webkitBoxShadow = a
		}
	};
	s7sdk.Thumb.prototype.showOverState = function(a) {
		if (!this.selected_) {
			s7sdk.Util.css.setCSSAttributeSelector(this.imgDiv, "state",
					a ? "over" : "default")
		}
	};
	s7sdk.Thumb.prototype.setOverlayType = function(a) {
		s7sdk.Util.css.setCSSAttributeSelector(this.overlayDiv, "type", a ? a
				: "")
	};
	s7sdk.Thumb.prototype.createOverlayDiv = function() {
		var a = this.createDiv();
		a.className = "s7thumboverlay";
		a.style.backgroundRepeat = "no-repeat";
		a.style.backgroundPosition = "center";
		return a
	};
	s7sdk.Thumb.prototype.createImgDiv = function() {
		var a = this.createDiv();
		a.className = "s7thumb";
		a.style.backgroundRepeat = "no-repeat";
		a.style.backgroundPosition = "center";
		return a
	};
	s7sdk.Thumb.prototype.createTxtDiv = function() {
		var a = this.createDiv();
		a.style.textAlign = "center";
		a.style.wordWrap = "break-word";
		a.className = "s7label";
		return a
	};
	s7sdk.Thumb.prototype.createMainDiv = function() {
		var a = this.createDiv();
		a.className = "s7thumbcell";
		return a
	};
	s7sdk.Thumb.prototype.createDiv = function(a) {
		var b = document.createElement("div");
		return b
	}
}
if (!s7sdk.SimpleToolTip) {
	s7sdk.SimpleToolTip = function SimpleToolTip(d, c, a) {
		this.target_ = null;
		this.content_ = null;
		this.toolTip_ = null;
		this.container_ = a;
		if ("ontouchstart" in window) {
			return
		}
		this.createToolTip();
		var b = this;
		this.__rollOverHandler = function(f) {
			b.rollOverHandler(f)
		};
		this.__rollOutHandler = function(f) {
			b.rollOutHandler(f)
		};
		this.__mouseMoveHandler = function(f) {
			b.mouseMoveHandler(f)
		};
		this.setTarget(d);
		this.setContent(c)
	};
	s7sdk.SimpleToolTip.prototype.getContainer = function() {
		return this.container_ || this.target_.parentNode
	};
	s7sdk.SimpleToolTip.prototype.getTarget = function() {
		return this.target_
	};
	s7sdk.SimpleToolTip.prototype.setTarget = function(a) {
		if (this.toolTip_) {
			this.removeToolTip();
			if (this.target_) {
				s7sdk.Event.removeDOMListener(this.target_, "mouseover",
						this.__rollOverHandler);
				s7sdk.Event.removeDOMListener(this.target_, "mouseout",
						this.__rollOutHandler);
				s7sdk.Event.removeDOMListener(this.target_, "mousemove",
						this.__mouseMoveHandler)
			}
			if (a) {
				s7sdk.Event.addDOMListener(a, "mouseover",
						this.__rollOverHandler, true);
				s7sdk.Event.addDOMListener(a, "mouseout",
						this.__rollOutHandler, true);
				s7sdk.Event.addDOMListener(a, "mousemove",
						this.__mouseMoveHandler, true)
			}
		}
		this.target_ = a
	};
	s7sdk.SimpleToolTip.prototype.getContent = function() {
		return this.content_
	};
	s7sdk.SimpleToolTip.prototype.setContent = function(a) {
		if (this.toolTip_) {
			this.toolTip_.innerHTML = a;
			this.content_ = a
		}
	};
	s7sdk.SimpleToolTip.prototype.cleanUp = function() {
		this.setTarget(null)
	};
	s7sdk.SimpleToolTip.prototype.removeToolTip = function() {
		if (this.toolTip_ && this.toolTip_.parentNode) {
			this.toolTip_.parentNode.removeChild(this.toolTip_)
		}
	};
	s7sdk.SimpleToolTip.prototype.rollOverHandler = function(c) {
		var a = this.getContainer();
		if (a) {
			var b = this.toolTip_.style.visibility;
			this.toolTip_.style.visibility = "hidden";
			a.appendChild(this.toolTip_);
			this.positionToolTip(new s7sdk.Point2D(c.clientX, c.clientY));
			this.toolTip_.style.visibility = b
		}
	};
	s7sdk.SimpleToolTip.prototype.positionToolTip = function(b) {
		if (this.toolTip_) {
			var i = this.toolTip_.parentNode;
			while (i != null) {
				i = i.parentNode;
				if (i != null && typeof (i.s7base) == "object" && s7sdk.common
						&& s7sdk.common.Container
						&& (i.s7base instanceof s7sdk.common.Container)) {
					break
				}
			}
			var c = s7sdk.Util.getScrollXY();
			var d = s7sdk.browser.detectScreen();
			var h = this.getElementCoords(this.getContainer());
			var e = 0;
			var a = 0;
			if (i != null) {
				d.w = i.offsetWidth;
				d.h = i.offsetHeight;
				var g = document.fullscreenElement
						|| document.mozFullScreenElement
						|| document.webkitFullscreenElement;
				if (!(s7sdk.browser.name === "chrome" && g)) {
					e = i.offsetLeft;
					a = i.offsetTop
				}
			}
			var f = {
				x : c.x + b.x - h.x + 20,
				y : c.y + b.y - h.y + 20
			};
			if (b.x + this.toolTip_.clientWidth + 35 >= e + d.w) {
				f.x = c.x + b.x - h.x - this.toolTip_.clientWidth - 20
			}
			if (b.y + this.toolTip_.clientHeight + 35 >= a + d.h) {
				f.y = c.y + b.y - h.y - this.toolTip_.clientHeight - 20
			}
			this.toolTip_.style.left = f.x + "px";
			this.toolTip_.style.top = f.y + "px"
		}
	};
	s7sdk.SimpleToolTip.prototype.rollOutHandler = function(a) {
		this.removeToolTip()
	};
	s7sdk.SimpleToolTip.prototype.mouseMoveHandler = function(a) {
		if (this.toolTip_.parentNode) {
			this.positionToolTip(new s7sdk.Point2D(a.clientX, a.clientY))
		}
	};
	s7sdk.SimpleToolTip.prototype.getElementCoords = function(c) {
		var b = document.documentElement || document.body;
		var e = window.pageXOffset || b.scrollLeft;
		var d = window.pageYOffset || b.scrollTop;
		var a = c.getBoundingClientRect().left + e;
		var f = c.getBoundingClientRect().top + d;
		return new s7sdk.Point2D(a, f)
	};
	s7sdk.SimpleToolTip.prototype.createToolTip = function() {
		this.toolTip_ = document.createElement("div");
		this.toolTip_.className = "s7tooltip";
		this.toolTip_.style.position = "absolute";
		this.toolTip_.style.whiteSpace = "nowrap";
		this.toolTip_.style.pointerEvents = "none"
	}
}
if (s7sdk.SimpleToolTip) {
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7tooltip", {
			position : "absolute",
			padding : "5px",
			"line-height" : "100%",
			"text-align" : "center",
			"background-color" : "rgb(224, 224, 224)",
			color : "rgb(26,26,26)",
			"font-family" : "Helvetica, sans-serif",
			"font-size" : "11px",
			border : "1px solid rgb(191,191,191)"
		});
		s7sdk.Util.css.addDefaultCSS(a, "SimpleToolTip")
	})()
};