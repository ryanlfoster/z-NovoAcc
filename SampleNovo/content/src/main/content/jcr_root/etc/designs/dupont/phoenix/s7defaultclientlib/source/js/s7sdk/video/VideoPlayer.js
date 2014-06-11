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
s7sdk.Util.require("s7sdk.common.ItemDesc");
s7sdk.Util.require("s7sdk.common.IS");
s7sdk.Util.require("s7sdk.common.IconEffect");
s7sdk.Util.require("s7sdk.common.Enumeration");
s7sdk.Util.require("s7sdk.event.Event");
if (!s7sdk.video.VideoPlayer) {
	s7sdk.video.VideoPlayer = function VideoPlayer(a, e, c) {
		arguments.callee.superclass.apply(this, [ c, a, "div", "s7videoplayer",
				e ]);
		this.createElement();
		this.container = s7sdk.Util.byId(a);
		if (this.videoServerUrl.lastIndexOf("/") != (this.videoServerUrl.length - 1)) {
			this.videoServerUrl += "/"
		}
		this.compId = (s7sdk.Util.isNull(c) ? "" : c);
		this.videoItem = null;
		this.serverDuration = undefined;
		this.curMilestone = undefined;
		this.seekTime = undefined;
		this.userPosterImage = undefined;
		this.endNotificationSent = false;
		this.videoCapabilityState = new s7sdk.VideoCapabilityState();
		this.wid = this.size.width;
		this.hei = this.size.height;
		if (this.wid == 0 || this.hei == 0) {
			this.wid = parseInt(s7sdk.Util.css.getCss("s7videoplayer", "width",
					this.compId, null, this.container));
			this.hei = parseInt(s7sdk.Util.css.getCss("s7videoplayer",
					"height", this.compId, null, this.container));
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
					this.hei = 300
				}
			}
		}
		this.obj.style.width = this.wid + "px";
		this.obj.style.height = this.hei + "px";
		if (("ipad" == s7sdk.browser.device.name)
				|| ("iphone" == s7sdk.browser.device.name)
				|| ("android" == s7sdk.browser.device.name)) {
			this.autoplay = false
		}
		this.clickToPlay = 0;
		if ((/play/i).test(this.singleclick)) {
			this.clickToPlay = 1
		}
		if (this.serverUrl.lastIndexOf("/") != (this.serverUrl.length - 1)) {
			this.serverUrl += "/"
		}
		this.container.appendChild(this.obj);
		var b = this;
		this.videoProxy = this.resolveVideoProxy();
		if (this.clickToPlay && !this.hasNativeControls()) {
			this.divClickElement = document.createElement("div");
			this.obj.appendChild(this.divClickElement);
			this.divClickElement.style.width = this.wid + "px";
			this.divClickElement.style.height = this.hei + "px";
			this.divClickElement.style.position = "absolute";
			this.divClickElement.style.top = "0px";
			this.divClickElement.style.left = "0px";
			if (s7sdk.browser.name == "ie") {
				if (s7sdk.browser.version.minor < 9) {
					this.divClickElement.style.backgroundColor = "#000";
					this.divClickElement.style.filter = "alpha(opacity=0)"
				} else {
					this.divClickElement.style.opacity = 0;
					this.divClickElement.style.filter = ""
				}
				if (s7sdk.browser.version.minor == 9
						|| s7sdk.browser.version.minor == 10) {
					this.divClickElement.style.backgroundColor = "#000000"
				}
			}
			if ("ontouchstart" in window) {
				s7sdk.Event.addDOMListener(this.divClickElement, "touchend",
						function(f) {
							b.ovlInTouch = true
						}, false);
				s7sdk.Event.addDOMListener(this.obj, "click", function(f) {
					if (b.ovlInTouch) {
						b.togglePause()
					}
					b.ovlInTouch = false
				}, false)
			} else {
				s7sdk.Event.addDOMListener(this.obj, "click", function(f) {
					b.togglePause()
				}, false)
			}
		}
		if (!this.hasNativeControls()) {
			s7sdk.Event.addDOMListener(this.obj, "click", function(f) {
				s7sdk.Event.dispatch(b.obj, s7sdk.Event.CLICK, false)
			}, false)
		}
		this.createIconEffect();
		var d = unescape(this.asset);
		if (d != "") {
			this.setAsset(d)
		}
		this.addEventListener(
				s7sdk.event.CapabilityStateEvent.NOTF_VIDEO_CAPABILITY_STATE,
				function(f) {
					b.onCapabilityState(f)
				}, false);
		this.setCaption(this.caption.file);
		this.setCaptionEnabled(this.caption.enabled)
	};
	s7sdk.Class.inherits("s7sdk.video.VideoPlayer", "s7sdk.UIComponent");
	s7sdk.video.VideoPlayer.prototype.symbols = {
		ERROR : "Your Browser does not support HTML5 Video tag or the video cannot be played."
	};
	s7sdk.video.VideoPlayer.prototype.modifiers = {
		serverUrl : {
			params : [ "isRootPath" ],
			defaults : [ "/is/image/" ]
		},
		videoServerUrl : {
			params : [ "value" ],
			defaults : [ "/is/content/" ]
		},
		size : {
			params : [ "width", "height" ],
			defaults : [ 0, 0 ],
			ranges : [ "0:", "0:" ]
		},
		asset : {
			params : [ "value" ],
			defaults : [ "" ]
		},
		autoplay : {
			params : [ "enabled" ],
			defaults : [ true ]
		},
		singleclick : {
			params : [ "singleclick" ],
			defaults : [ "playPause" ],
			ranges : [ [ "none", "playPause" ] ]
		},
		posterimage : {
			params : [ "posterimage" ],
			defaults : [ "" ]
		},
		iconEffect : {
			params : [ "enabled", "count", "fade", "autoHide" ],
			defaults : [ true, 1, 0.3, 3 ],
			ranges : [ null, "-1:", "0:", "0:" ]
		},
		playback : {
			params : [ "type", "controls" ],
			defaults : [ "auto", false ],
			ranges : [ [ "auto", "native" ] ]
		},
		progressivebitrate : {
			params : [ "value" ],
			defaults : [ 900 ]
		},
		caption : {
			params : [ "file", "enabled" ],
			defaults : [ "", false ]
		},
		smoothing : {
			params : [ "enabled" ],
			defaults : [ false ]
		}
	};
	s7sdk.video.VideoPlayer.prototype.addEventListener = function(c, b, a) {
		this.superproto.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.video.VideoPlayer.prototype.onCapabilityState = function(a) {
		var b = a.s7event.state;
		if (b.hasCapability(s7sdk.VideoCapabilityState.PAUSE)) {
			if (this.iconEffectObj) {
				this.iconEffectObj.hide()
			}
		}
		if (b.hasCapability(s7sdk.VideoCapabilityState.PLAY)) {
			if (this.iconEffectObj) {
				this.iconEffectObj.show(this.wid, this.hei);
				s7sdk.Util.css.setCSSAttributeSelector(this.iconEffectObj.obj,
						"state", "play")
			}
		}
		if (b.hasCapability(s7sdk.VideoCapabilityState.REPLAY)) {
			if (this.iconEffectObj) {
				this.iconEffectObj.show(this.wid, this.hei);
				s7sdk.Util.css.setCSSAttributeSelector(this.iconEffectObj.obj,
						"state", "replay")
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.resize = function(a, b) {
		if (a == this.wid && b == this.hei) {
			return
		}
		this.wid = a > 0 ? a : 1;
		this.hei = b > 0 ? b : 1;
		this.videoProxy.resize(this.wid, this.hei);
		this.obj.style.width = this.wid + "px";
		this.obj.style.height = this.hei + "px";
		if (this.divClickElement) {
			this.divClickElement.style.width = this.wid + "px";
			this.divClickElement.style.height = this.hei + "px"
		}
		if (this.iconEffectObj && this.iconEffectObj.enabled) {
			this.iconEffectObj.centerOverlay(a, b)
		}
		if (this.captionContainerDiv) {
			this.obj.removeChild(this.captionContainerDiv);
			this.captionContainerDiv = undefined
		}
		s7sdk.UIComponent.prototype.resize.apply(this, [ a, b ]);
		s7sdk.Logger
				.log(s7sdk.Logger.INFO, "VideoPlayer.resize( %0 %1 )", a, b)
	};
	s7sdk.video.VideoPlayer.prototype.supportsInline = function() {
		s7sdk.Logger
				.log(
						s7sdk.Logger.INFO,
						"VideoPlayer.supportsInline() = %0",
						!((s7sdk.browser.device.name == "android" && s7sdk.browser.device.version < 4) || s7sdk.browser.device.name == "iphone"));
		return !((s7sdk.browser.device.name == "android" && s7sdk.browser.device.version < 4) || s7sdk.browser.device.name == "iphone")
	};
	s7sdk.video.VideoPlayer.prototype.getAsset = function() {
		var a = (this.videoItem == null ? null : this.videoItem.name);
		s7sdk.Logger.log(s7sdk.Logger.INFO, "VideoPlayer.getAsset() = %0", a);
		return a
	};
	s7sdk.video.VideoPlayer.prototype.setAsset = function(b, a) {
		this.userPosterImage = a;
		this.loadAsset(b)
	};
	s7sdk.video.VideoPlayer.prototype.setCaption = function(a) {
		this.caption.file = a;
		this.captionCues = [];
		if (s7sdk.Util.isNonEmptyString(this.caption.file)) {
			this.loadWebVTT()
		}
	};
	s7sdk.video.VideoPlayer.prototype.loadAsset = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "VideoPlayer.loadAsset");
		var c = s7sdk.MediaSetParser.parseAssetForSetReq(a);
		var b = this.serverUrl + "/" + c.name;
		b += "?" + c.req;
		if (s7sdk.Util.isNonEmptyString(this.locale)) {
			b += "&locale=" + this.locale
		}
		if (this.isReq) {
			this.isReq.cancelHttpReq()
		}
		this.isReq_ = new s7sdk.IS(this.serverUrl, a);
		this.isReq_.getHttpReq(b, function(e, d) {
			s7sdk.video.VideoPlayer.prototype.setRequestComplete
					.apply(d, [ e ])
		}, function(e, d) {
			s7sdk.video.VideoPlayer.prototype.setRequestError
					.apply(d, [ e, a ])
		}, this)
	};
	s7sdk.video.VideoPlayer.prototype.loadWebVTT = function() {
		var e = this.caption.file;
		var c = this;
		try {
			var g = a();
			var f = setTimeout(function() {
				s7sdk.Logger.log(s7sdk.Logger.ERROR,
						"Timeout loading caption file %0.", e);
				g.abort()
			}, 1000);
			g.open("GET", e, true);
			g.onreadystatechange = function() {
				if (g.readyState != 4) {
					return
				}
				clearTimeout(f);
				if (g.status != 200) {
					s7sdk.Logger.log(s7sdk.Logger.ERROR,
							"Failed to load %0 with response %1.", e, g.status);
					return
				}
				c.parseWebVTT(g.responseText)
			};
			g.send(null)
		} catch (d) {
			if ("XDomainRequest" in window && window.XDomainRequest !== null) {
				var b = new XDomainRequest();
				b.open("get", e);
				b.onload = function() {
					var h = new ActiveXObject("Microsoft.XMLDOM");
					h.async = false;
					c.parseWebVTT(b.responseText)
				};
				b.onerror = function() {
					s7sdk.Logger.log(s7sdk.Logger.ERROR,
							"XDR error loading %0.", e)
				};
				b.send()
			} else {
				s7sdk.Logger.log(s7sdk.Logger.ERROR, "XHTTP error loading %0.",
						e)
			}
		}
		function a() {
			try {
				return new XMLHttpRequest()
			} catch (h) {
			}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP")
			} catch (h) {
			}
			s7sdk.Logger
					.log(s7sdk.Logger.ERROR, "XMLHttpRequest not supported");
			return null
		}
	};
	s7sdk.video.VideoPlayer.prototype.parseWebVTT = function(f) {
		this.captionCues = [];
		var k = f.split("\n");
		var d = 0;
		var h = 0;
		var c = true;
		var b = "", a = "", g = "";
		var i = false;
		for ( var e in k) {
			if (!k.hasOwnProperty(e)) {
				continue
			}
			var j = k[e].toString().trim();
			if (c) {
				if (e == 0) {
					continue
				} else {
					if (j.length == 0) {
						continue
					}
				}
				c = false
			}
			if (j.length == 0) {
				if (h > 1) {
					if (b.length > 0) {
						this.addCaption(b, a)
					} else {
					}
				}
				d += 1;
				h = 0;
				b = a = g = ""
			} else {
				if (h < 2 && b.length == 0) {
					if (/(\d\d\:\d\d[.,]\d\d\d)\s+--\>/.test(j)) {
						i = true;
						b = j;
						a = ""
					} else {
						g = j;
						if (!i) {
							if (a.length > 0) {
								a += "\n"
							}
							a += j
						}
					}
				} else {
					if (a.length > 0) {
						a += "\n"
					}
					a += j
				}
				h += 1
			}
		}
		if (h > 1) {
			this.addCaption(b, a)
		}
	};
	s7sdk.video.VideoPlayer.prototype.parseCueSettings = function(e) {
		var d = {
			lineSize : "100%",
			textPosition : "50%",
			textAlign : "middle",
			vertical : ""
		};
		var a = b(e);
		if (a.hasOwnProperty("region")) {
		}
		if (a.hasOwnProperty("D")) {
			if (a.D == "vertical-lr") {
				d.vertical = "lr"
			} else {
				if (a.D == "vertical-rl") {
					d.vertical = "rl"
				}
			}
		}
		if (a.hasOwnProperty("L")) {
			if (/-?\d*%?/.test(a.L)) {
				d.linePosition = a.L
			}
		}
		if (a.hasOwnProperty("T")) {
			if (/\d%/.test(a.T)) {
				var c = parseInt(a.T);
				if (c >= 0 && c <= 100) {
					d.textPosition = a.T
				}
			}
		}
		if (a.hasOwnProperty("S")) {
			d.lineSize = a.S
		}
		if (a.hasOwnProperty("A")) {
			if (/(left)|(right)/.test(a.A)) {
				d.textAlign = a.A
			} else {
				if (a.A == "end") {
					d.textAlign = "right"
				} else {
					if (a.A == "start") {
						d.textAlign = "left"
					}
				}
			}
		}
		return d;
		function b(j) {
			var h = j.split(" ");
			var g = 0, f = [];
			for (; g < h.length; g++) {
				var i = h[g].split(":", 2);
				if (i && i.length > 0) {
					f[i[0].replace(/^\s*?/, "")] = i.length > 1 ? i[1] : ""
				}
			}
			return f
		}
	};
	s7sdk.video.VideoPlayer.prototype.parseCueText = function(a) {
		return a.replace(/(<(\d\d\:)?\d\d\:\d\d[.,]\d\d\d>)/g, " ")
	};
	s7sdk.video.VideoPlayer.prototype.addCaption = function(e, f, a) {
		if (e.length == 0 || f.length == 0) {
			return
		}
		var b = e.match(/((\d\d\:)?\d\d\:\d\d[.,]\d\d\d)/g);
		if (b.length < 2) {
			return
		}
		var d = e.substring(e.indexOf(b[1]) + b[1].length);
		this.captionCues.push({
			start : c(b[0]),
			end : c(b[1]),
			caption : this.parseCueText(f),
			settings : this.parseCueSettings(d)
		});
		function c(j) {
			var k = j.split(":");
			var g = 0, h = 0, i = 0;
			if (k.length > 0) {
				i = parseFloat(k[k.length - 1])
			} else {
				return -1
			}
			if (k.length > 1) {
				h = parseInt(k[k.length - 2])
			}
			if (k.length > 2) {
				g = parseInt(k[k.length - 3])
			}
			return ((g * 60 + h) * 60 + i) * 1000
		}
	};
	s7sdk.video.VideoPlayer.prototype.setRequestComplete = function(b) {
		var a = b.set;
		if (a == null) {
			return
		}
		var c = s7sdk.MediaSetParser.parse(a, "");
		switch (c.type) {
		case s7sdk.ItemDescType.VIDEO_SET:
			this.createViewer(c);
			break;
		case s7sdk.ItemDescType.VIDEO:
			this.createViewer(c.items[0]);
			break;
		default:
			throw new Error("parsed media set is of wrong type: " + c.type)
		}
	};
	s7sdk.video.VideoPlayer.prototype.createViewer = function(a) {
		this.setAssetInternal(a);
		this.settings.trackLoad(this);
		var c = new s7sdk.UserEvent(this.autoplay ? s7sdk.UserEvent.PLAY
				: s7sdk.UserEvent.PAUSE, this.videoProxy.getCurrentTime(), true);
		this.dispatchEvent(c, false);
		var b = new s7sdk.event.AssetEvent(
				s7sdk.event.AssetEvent.ASSET_CHANGED, a, this
						.getIndexFromItem(a), true);
		this.dispatchEvent(b)
	};
	s7sdk.video.VideoPlayer.prototype.getIndexFromItem = function(d) {
		if (d.parent != null) {
			var c = -1;
			var b = d.parent.items;
			for ( var a = 0; a < b.length; a++) {
				if (b[a].name == d.name) {
					c = a;
					break
				}
			}
			return c
		} else {
			return 0
		}
	};
	s7sdk.video.VideoPlayer.prototype.createIconEffect = function() {
		if (this.clickToPlay && !this.hasNativeControls()) {
			this.iconEffectObj = new s7sdk.IconEffect(this,
					this.iconEffect.enabled, this.iconEffect.count,
					this.iconEffect.fade, this.iconEffect.autoHide);
			if (this.autoplay) {
				this.iconEffectObj.hide()
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.hasNativeControls = function() {
		if (s7sdk.browser.supportflash() && this.playback.type == "auto") {
			return false
		} else {
			if ((s7sdk.browser.device.name == "android" && s7sdk.browser.device.version < 4)
					|| s7sdk.browser.device.name == "iphone"
					|| this.playback.controls) {
				return true
			} else {
				return false
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.setCaptionEnabled = function(a) {
		var b = !this.enableCaptions && a && this.videoProxy.paused();
		this.enableCaptions = a;
		if (!this.enableCaptions) {
			if (this.currentCaption) {
				this.hideCaption();
				this.currentCaption = null
			}
		} else {
			if (b && this.videoProxy) {
				this.checkCaptions(this.videoProxy.getCurrentTime())
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.getCaptionEnabled = function() {
		return this.enableCaptions
	};
	s7sdk.video.VideoPlayer.prototype.checkCaptions = function(b) {
		if (this.captionCues.length == 0) {
			return
		}
		if (!this.enableCaptions) {
			return
		}
		var a = this.findCaption(b);
		if (this.currentCaption && a && this.currentCaption.start == a.start) {
			return
		}
		this.currentCaption = a;
		if (a) {
			this.showCaption(a.caption, a.settings)
		} else {
			this.hideCaption()
		}
	};
	s7sdk.video.VideoPlayer.prototype.showCaption = function(i, c) {
		if (!this.captionContainerDiv) {
			this.captionContainerDiv = document.createElement("div");
			this.captionContainerDiv.style.position = "absolute";
			this.captionContainerDiv.style.visibility = "hidden";
			this.captionContainerDiv.style.overflow = "hidden";
			if (this.iconEffectObj.hiddenState_) {
				this.obj.appendChild(this.captionContainerDiv)
			} else {
				this.obj.insertBefore(this.captionContainerDiv,
						this.iconEffectObj.iconEffectDiv_)
			}
			this.captionDiv = document.createElement("div");
			this.captionDiv.className = "s7caption";
			this.captionDiv.style.visibility = "hidden";
			this.captionContainerDiv.appendChild(this.captionDiv);
			this.captionDiv.style.position = "relative";
			this.captionDiv.style.display = "table"
		} else {
			this.captionDiv.style.visibility = "hidden"
		}
		this.captionContainerDiv.style.width = this.wid + "px";
		this.captionDiv.innerText = i;
		this.captionDiv.textContent = i;
		var g = this.captionDiv.offsetHeight;
		var e = this.captionDiv.offsetWidth;
		var h, b, a;
		if (c.vertical == "rl") {
			h = Math.round((100 - parseInt(c.lineSize)) / 2);
			this.captionContainerDiv.style.top = h + "%";
			this.captionContainerDiv.style.height = c.lineSize;
			this.captionContainerDiv.style.left = c.linePosition
		} else {
			if (c.vertical == "lr") {
				h = Math.round((100 - parseInt(c.lineSize)) / 2);
				this.captionContainerDiv.style.top = h + "%";
				this.captionContainerDiv.style.height = c.lineSize;
				b = (100 - parseInt(c.linePosition));
				this.captionContainerDiv.style.left = b + "%"
			} else {
				e = Math.min(Math.round(parseInt(c.lineSize) * this.wid / 100),
						e);
				this.captionContainerDiv.style.width = e + "px";
				e = this.captionDiv.offsetWidth;
				b = Math.round(((parseInt(c.textPosition) / 100) * this.wid)
						- e / 2);
				b = b < 0 ? 0 : b;
				if ((b + e) > this.wid) {
					b = this.wid - e
				}
				this.captionContainerDiv.style.left = b + "px";
				g = this.captionDiv.offsetHeight;
				var f = (g / this.hei) * 100;
				if (c.linePosition) {
					if (c.linePosition.indexOf("%") > 0) {
						var d = parseInt(c.linePosition);
						h = d - (f) / 2;
						a = d + f;
						if (f > 100) {
							h = 0
						} else {
							if (h < 0) {
								h = 0
							} else {
								if (a > 100) {
									if (f > 100) {
										h = 0
									} else {
										h = 100 - f
									}
								}
							}
						}
						if ((f + h) > 100) {
							f = 100 - h
						}
						this.captionContainerDiv.style.top = h + "%";
						this.captionContainerDiv.style.bottom = (h + f) + "%"
					} else {
						this.captionContainerDiv.style.bottom = (g * (c.linePosition - 1))
								+ "px"
					}
				} else {
					if (f > 85) {
						this.captionContainerDiv.style.top = "0"
					} else {
						this.captionContainerDiv.style.top = (85 - f) + "%"
					}
					this.captionContainerDiv.style.bottom = "15%"
				}
			}
		}
		if (c.vertical == "rl") {
			this.captionDiv.style.writingMode = "tb-rl"
		} else {
			if (c.vertical == "lr") {
				this.captionDiv.style.writingMode = "tb-rl"
			}
		}
		if (c.textAlign == "left") {
			this.captionDiv.style.textAlign = "left"
		} else {
			if (c.textAlign == "right") {
				this.captionDiv.style.textAlign = "right"
			} else {
				if (c.textAlign == "middle") {
					this.captionDiv.style.textAlign = "center"
				}
			}
		}
		this.captionDiv.style.visibility = "visible";
		this.captionContainerDiv.visibility = "visible"
	};
	s7sdk.video.VideoPlayer.prototype.hideCaption = function() {
		if (this.captionContainerDiv) {
			this.captionDiv.style.visibility = "hidden";
			this.captionContainerDiv.visibility = "hidden";
			this.captionDiv.innerText = "";
			this.captionDiv.textContent = ""
		}
	};
	s7sdk.video.VideoPlayer.prototype.findCaption = function(c) {
		for ( var a in this.captionCues) {
			var b = this.captionCues[a];
			if (!b) {
				continue
			}
			if (b.start <= c && c <= b.end) {
				return b
			}
		}
		return null
	};
	s7sdk.video.VideoPlayer.prototype.resolveVideoProxy = function() {
		var b;
		if ((s7sdk.browser.supportflash() && this.playback.type == "auto")
				&& (s7sdk.browser.device.name !== "android")) {
			b = this.buildFlashVideoProxy()
		} else {
			if ((s7sdk.browser.name == "ie")
					&& (s7sdk.browser.version.minor < 9)) {
				return b = this.buildNOOPVideoProxy()
			} else {
				b = this.buildHTML5VideoProxy()
			}
		}
		var a = this;
		b.onCurrentTime = function() {
			a.checkCaptions(a.videoProxy.getCurrentTime());
			if (!a.endNotificationSent) {
				a.checkMilestone()
			}
			a.checkState();
			if (!a.endNotificationSent) {
				var c = new s7sdk.event.VideoEvent(
						s7sdk.event.VideoEvent.NOTF_CURRENT_TIME, a.videoProxy
								.getCurrentTime(), true);
				a.dispatchEvent(c, false);
				if (a.videoProxy.ended()) {
					a.endNotificationSent = true;
					var e = new s7sdk.UserEvent(s7sdk.UserEvent.STOP,
							a.videoProxy.getCurrentTime(), true);
					a.dispatchEvent(e, false);
					var d = new s7sdk.event.VideoEvent(
							s7sdk.event.VideoEvent.NOTF_VIDEO_END, a.videoProxy
									.getCurrentTime(), true);
					a.dispatchEvent(d, false)
				}
			}
		};
		b.onDuration = function() {
			a.checkState();
			var c = new s7sdk.event.VideoEvent(
					s7sdk.event.VideoEvent.NOTF_DURATION, a.videoProxy
							.getDuration(), true);
			a.dispatchEvent(c, false)
		};
		b.onLoadProgress = function() {
			a.checkState();
			var c = new s7sdk.event.VideoEvent(
					s7sdk.event.VideoEvent.NOTF_LOAD_PROGRESS, a.videoProxy
							.getLoadedPosition(), true);
			a.dispatchEvent(c, false)
		};
		b.onVolume = function() {
			a.checkState();
			var c = new s7sdk.event.VideoEvent(
					s7sdk.event.VideoEvent.NOTF_VOLUME, a.videoProxy
							.getVolume(), true);
			a.dispatchEvent(c, false)
		};
		b.onSeeked = function() {
			var c = a.videoProxy.getCurrentTime();
			if (c != a.videoProxy.getDuration()) {
				if (a.videoProxy.paused()) {
					a.iconEffectObj.show(this.wid, this.hei)
				}
			}
			if (c != this.seekTime) {
				var d = new s7sdk.event.VideoEvent(
						s7sdk.event.VideoEvent.NOTF_SEEK, a.videoProxy
								.getCurrentTime(), true);
				a.dispatchEvent(d, false)
			}
			this.seekTime = a.videoProxy.getCurrentTime()
		};
		b.onStateChange = function() {
			a.checkState()
		};
		return b
	};
	s7sdk.video.VideoPlayer.prototype.resolvePosterUrl = function(b) {
		var c = (this.userPosterImage != undefined) ? this.userPosterImage
				: this.posterimage;
		var d = "";
		if (c == "" || c.indexOf("?") == 0) {
			d = c;
			c = s7sdk.video.VideoPlayer.parseMovieUrl(b.name)
		}
		var a = null;
		if (c != null && c != "" && c != "none") {
			var e = (c.indexOf("?") >= 0) ? "&" : "?";
			if (d != "") {
				if (d.indexOf("?") == 0) {
					e = d
				} else {
					e += d
				}
				e += "&"
			}
			e += "fit=constrain,1&wid=" + this.wid + "&hei=" + this.hei;
			a = c + e
		}
		return a
	};
	s7sdk.video.VideoPlayer.prototype.buildHTML5VideoProxy = function() {
		return new s7sdk.video.HTML5VideoProxy(this.obj, this.wid, this.hei,
				this.serverUrl, this.videoServerUrl, this.autoplay,
				this.playback, this.progressivebitrate, this
						.getLocalizedText("ERROR"))
	};
	s7sdk.video.VideoPlayer.prototype.buildFlashVideoProxy = function() {
		return new s7sdk.video.FlashVideoProxy(this.obj,
				(this.compId != "") ? this.compId + "_"
						+ s7sdk.Util.createUniqueId() : "flashVideo_"
						+ s7sdk.Util.createUniqueId(), this.wid, this.hei,
				this.serverUrl, this.videoServerUrl, this.autoplay,
				this.playback, this.progressivebitrate, this.smoothing)
	};
	s7sdk.video.VideoPlayer.prototype.buildNOOPVideoProxy = function() {
		return new s7sdk.video.NOOPVideoProxy(this.obj, this.wid, this.hei,
				this.serverUrl, this.videoServerUrl, this.autoplay,
				this.playback, this.progressivebitrate, this
						.getLocalizedText("ERROR"))
	};
	s7sdk.video.VideoPlayer.prototype.setRequestError = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.ERROR, "setRequestError %0", a)
	};
	s7sdk.video.VideoPlayer.prototype.setAssetInternal = function(a) {
		var d = this.videoItem;
		this.videoItem = a;
		this.serverDuration = this.getDurationFromItem(a);
		if (!s7sdk.Util.isNull(this.serverDuration)) {
			var c = new s7sdk.event.VideoEvent(
					s7sdk.event.VideoEvent.NOTF_DURATION, this.serverDuration,
					true);
			this.dispatchEvent(c, false)
		}
		s7sdk.Logger.log(s7sdk.Logger.INFO, "VideoPlayer.setAsset( %0 )",
				a.name
						+ (this.userPosterImage ? ", " + this.userPosterImage
								: ""));
		this.videoProxy.setAsset(a, this.resolvePosterUrl(a));
		if (this.autoplay) {
			this.videoProxy.play()
		}
		if (d != null) {
			var b = new s7sdk.UserEvent(s7sdk.UserEvent.SWAP, [ 0, a.name ],
					true);
			this.dispatchEvent(b, false)
		}
	};
	s7sdk.video.VideoPlayer.prototype.setItem = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "VideoPlayer.setItem( %0 )", a);
		if (this.isReq) {
			this.isReq.cancelHttpReq()
		}
		if (!((a instanceof s7sdk.VideoDesc && a.type == s7sdk.ItemDescType.VIDEO) || (a instanceof s7sdk.MediaSetDesc && a.type == s7sdk.ItemDescType.VIDEO_SET))) {
			throw new Error("Item must be a video!")
		}
		this.createViewer(a)
	};
	s7sdk.video.VideoPlayer.prototype.getVolume = function() {
		if (this.supportsVolumeControl()) {
			return this.videoProxy.getVolume()
		} else {
			return 1
		}
	};
	s7sdk.video.VideoPlayer.prototype.setVolume = function(a) {
		if (this.supportsVolumeControl()) {
			this.videoProxy.setVolume(a);
			this.checkState()
		}
	};
	s7sdk.video.VideoPlayer.prototype.getCurrentTime = function() {
		return this.videoProxy.getCurrentTime()
	};
	s7sdk.video.VideoPlayer.prototype.getLoadedPosition = function() {
		return this.videoProxy.getLoadedPosition()
	};
	s7sdk.video.VideoPlayer.prototype.getDuration = function() {
		if (!s7sdk.Util.isNull(this.videoProxy.getDuration())) {
			return this.videoProxy.getDuration()
		} else {
			if (!s7sdk.Util.isNull(this.serverDuration)) {
				return this.serverDuration
			} else {
				return undefined
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.getCapabilityState = function() {
		s7sdk.Logger.log(s7sdk.Logger.INFO,
				"VideoPlayer.getCapabilityState() = %0 ",
				this.videoCapabilityState);
		return this.videoCapabilityState
	};
	s7sdk.video.VideoPlayer.prototype.checkState = function() {
		var a = this.videoCapabilityState;
		this.videoCapabilityState = new s7sdk.VideoCapabilityState();
		if (this.videoProxy.paused() && !this.videoProxy.ended()) {
			this.videoCapabilityState
					.setCapability(s7sdk.VideoCapabilityState.PLAY);
			if (this.videoProxy.getCurrentTime() > 0) {
				this.videoCapabilityState
						.setCapability(s7sdk.VideoCapabilityState.STOP)
			}
		}
		if (!this.videoProxy.paused() && !this.videoProxy.ended()) {
			if (((s7sdk.browser.name == "chrome") || ((s7sdk.browser.name == "safari") && (s7sdk.browser.version.minor == 6)))
					&& (s7sdk.browser.device.name == "desktop")) {
				this.divClickElement.style.opacity = 0;
				this.divClickElement.style.opacity = 1
			}
			this.videoCapabilityState
					.setCapability(s7sdk.VideoCapabilityState.PAUSE);
			this.videoCapabilityState
					.setCapability(s7sdk.VideoCapabilityState.STOP)
		}
		this.videoProxy.muted() ? this.videoCapabilityState
				.setCapability(s7sdk.VideoCapabilityState.UNMUTE)
				: this.videoCapabilityState
						.setCapability(s7sdk.VideoCapabilityState.MUTE);
		if (this.videoProxy.ended()) {
			this.videoCapabilityState
					.setCapability(s7sdk.VideoCapabilityState.REPLAY)
		}
		if ((a == null) || (a.state != this.videoCapabilityState.state)) {
			this
					.dispatchEvent(new s7sdk.event.CapabilityStateEvent(
							s7sdk.event.CapabilityStateEvent.NOTF_VIDEO_CAPABILITY_STATE,
							this.videoCapabilityState))
		}
	};
	s7sdk.video.VideoPlayer.prototype.ended = function() {
		return this.videoProxy.ended()
	};
	s7sdk.video.VideoPlayer.prototype.supportsFullScreen = function() {
		return this.videoProxy.supportsFullScreen()
	};
	s7sdk.video.VideoPlayer.prototype.enterFullScreen = function() {
		return this.videoProxy.enterFullScreen()
	};
	s7sdk.video.VideoPlayer.prototype.play = function() {
		if (!this.videoProxy.ended()) {
			this.videoProxy.play();
			var a = new s7sdk.UserEvent(s7sdk.UserEvent.PLAY, this.videoProxy
					.getCurrentTime(), true);
			this.dispatchEvent(a, false);
			this.endNotificationSent = false
		}
	};
	s7sdk.video.VideoPlayer.prototype.pause = function() {
		this.videoProxy.pause();
		var a = new s7sdk.UserEvent(s7sdk.UserEvent.PAUSE, this.videoProxy
				.getCurrentTime(), true);
		this.dispatchEvent(a, false)
	};
	s7sdk.video.VideoPlayer.prototype.stop = function() {
		this.videoProxy.pause();
		this.videoProxy.seek(0);
		var a = new s7sdk.UserEvent(s7sdk.UserEvent.STOP, this.videoProxy
				.getCurrentTime(), true);
		this.dispatchEvent(a, false)
	};
	s7sdk.video.VideoPlayer.prototype.togglePause = function() {
		if (this.videoCapabilityState != null) {
			if (this.videoCapabilityState
					.hasCapability(s7sdk.VideoCapabilityState.PLAY)
					|| this.videoCapabilityState
							.hasCapability(s7sdk.VideoCapabilityState.REPLAY)) {
				var a = this.getDuration() - this.getCurrentTime();
				if (a <= 1) {
					this.seek(0)
				}
				this.play()
			} else {
				if (this.videoCapabilityState
						.hasCapability(s7sdk.VideoCapabilityState.PAUSE)) {
					this.pause()
				}
			}
		}
	};
	s7sdk.video.VideoPlayer.prototype.seek = function(a) {
		this.videoProxy.seek(a);
		this.endNotificationSent = false
	};
	s7sdk.video.VideoPlayer.prototype.mute = function() {
		if (this.supportsVolumeControl()) {
			this.videoProxy.mute(true);
			this.checkState()
		}
	};
	s7sdk.video.VideoPlayer.prototype.unmute = function() {
		if (this.supportsVolumeControl()) {
			this.videoProxy.mute(false);
			this.checkState()
		}
	};
	s7sdk.video.VideoPlayer.prototype.checkMilestone = function() {
		var a = this.videoProxy.getDuration();
		if (s7sdk.Util.isNull(a) || a == 0) {
			return
		}
		var c = s7sdk.Util.isNull(this.videoProxy.getCurrentTime()) ? 0
				: this.videoProxy.getCurrentTime();
		c = 25 * Math.floor((c * 4) / a);
		if (c != this.curMilestone) {
			this.curMilestone = c;
			var b = new s7sdk.UserEvent(s7sdk.UserEvent.MILESTONE,
					this.curMilestone, true);
			this.dispatchEvent(b, false)
		}
	};
	s7sdk.video.VideoPlayer.parseMovieUrl = function(b) {
		var a = null;
		if (b) {
			a = b.replace(/[\\]/g, "/");
			ar = a.split(".");
			if (ar.length > 1) {
				a = ar[0]
			}
			ar = a.split(":");
			if (ar.length > 1) {
				a = ar[1]
			}
			ar = a.split("/");
			a = ar.length > 1 ? ar[0] + "/" + ar[ar.length - 1] : a
		}
		return a
	};
	s7sdk.video.VideoPlayer.prototype.supportsVolumeControl = function() {
		var a = true;
		if (("ipad" == s7sdk.browser.device.name)
				|| ("iphone" == s7sdk.browser.device.name)
				|| ("android" == s7sdk.browser.device.name)) {
			a = false
		}
		return a
	};
	s7sdk.video.VideoPlayer.prototype.getDurationFromItem = function(b) {
		if (b.type == s7sdk.ItemDescType.VIDEO_SET) {
			var a = b.items[0];
			if (a.userData && a.userData.Video_Length) {
				return parseFloat(a.userData.Video_Length) * 1000
			}
		} else {
			if (b.userData && b.userData.Video_Length) {
				return parseFloat(b.userData.Video_Length) * 1000
			}
		}
		return undefined
	};
	s7sdk.VideoPlayer = s7sdk.video.VideoPlayer;
	(function addDefaultCSS() {
		var c = s7sdk.Util.css.createCssRuleText;
		var b = s7sdk.Util.css.createCssImgUrlText;
		var a = c(".s7videoplayer", {
			position : "absolute",
			"background-color" : "#000000",
			"-webkit-touch-callout" : "none",
			"-webkit-user-select" : "none",
			"-moz-user-select" : "none",
			"-ms-user-select" : "none",
			"user-select" : "none",
			"-webkit-tap-highlight-color" : "rgba(0,0,0,0)"
		}) + c(".s7videoplayer .s7iconeffect", {
			width : "120px",
			height : "120px",
			"-webkit-transform" : "translateZ(0px)",
			"background-repeat" : "no-repeat",
			"background-position" : "center"
		}) + c(".s7videoplayer .s7iconeffect[state='play']", {
			"background-image" : b("videoplayicon.png")
		}) + c(".s7videoplayer .s7iconeffect[state='replay']", {
			"background-image" : b("videoreplayicon.png")
		}) + c(".s7videoplayer .s7caption", {
			"font-family" : "sans-serif",
			"font-size" : "large",
			color : "#ffffff",
			"-webkit-transform" : "translateZ(0px)",
			margin : "0 auto"
		});
		s7sdk.Util.css.addDefaultCSS(a, "VideoPlayer")
	})()
}
if (!s7sdk.video.HTML5VideoProxy) {
	s7sdk.video.HTML5VideoProxy = function HTML5VideoProxy(h, e, g, a, i, c, b,
			d, f) {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "HTML5VideoProxy constructor");
		this.serverUrl = a;
		this.videoServerUrl = i;
		this.curTime = undefined;
		this.bufTime = undefined;
		this.videoDuration = undefined;
		this.fallbackmessage = f;
		this.volume = 1;
		this.playback = b;
		this.progressivebitrate = d * 1024;
		this.inWidth = e;
		this.inHeight = g;
		this.inContainer = h;
		this.inAutoPlay = c;
		this.inWidth = e;
		this.inHeight = g;
		this.needToReload = false;
		this.firstAsset = true;
		this.createVideoElement()
	};
	s7sdk.video.HTML5VideoProxy.prototype.createVideoElement = function() {
		if (this.videoElement) {
			this.inContainer.removeChild(this.videoElement)
		}
		this.videoElement = s7sdk.Util.createObj(null, "video", null, null);
		this.videoElement.style.position = "absolute";
		this.resize(this.inWidth, this.inHeight);
		this.videoElement.preload = "auto";
		if (s7sdk.browser.name == "ie") {
			this.videoElement.preload = "none"
		}
		this.inContainer.insertBefore(this.videoElement,
				this.inContainer.firstChild);
		this.videoElement.id = "s7VideoElement";
		if (this.inAutoPlay) {
			this.videoElement.autoplay = true
		}
		if (this.playback.controls) {
			this.videoElement.controls = true
		} else {
			if (("ipad" == s7sdk.browser.device.name)
					|| ("iphone" == s7sdk.browser.device.name)
					|| (("blackberry" == s7sdk.browser.device.name) && (s7sdk.browser.device.version == 10))) {
				this.videoElement.setAttribute("webkit-playsinline", 1)
			}
		}
		var a = this;
		if (!this.playTimer) {
			this.playTimer = setInterval(function() {
				a.timerHandler()
			}, s7sdk.video.HTML5VideoProxy.VIDEO_POLLING_RATE)
		}
		s7sdk.Event.addDOMListener(this.videoElement, "seeked", function() {
			a.onSeeked()
		}, true)
	};
	s7sdk.video.HTML5VideoProxy.VIDEO_POLLING_RATE = 100;
	s7sdk.video.HTML5VideoProxy.prototype.setAsset = function(c, a) {
		var h = s7sdk.MediaSetParser.resolveVideoAsset(c, this.playback,
				this.progressivebitrate);
		if (c.items) {
			this.videoWidth = c.items[0].width;
			this.videoHeight = c.items[0].height
		} else {
			if (c.width) {
				this.videoWidth = c.width;
				this.videoHeight = c.height
			}
		}
		if (this.firstAsset) {
			this.firstAsset = false
		} else {
			this.createVideoElement()
		}
		if (a != null) {
			this.videoElement.poster = this.serverUrl + a
		}
		var b = (this.videoServerUrl && this.videoServerUrl.length > 0 ? this.videoServerUrl
				.charAt(this.videoServerUrl.length - 1)
				: "");
		var g = (h && h.length > 0 ? h.charAt(0) : "");
		var e;
		if (b == "/" && g == "/") {
			e = this.videoServerUrl + h.substr(1)
		} else {
			e = this.videoServerUrl + h
		}
		while (this.videoElement.firstChild) {
			this.videoElement.removeChild(this.videoElement.firstChild)
		}
		var f = document.createElement("source");
		f.src = e;
		var d = document.createElement("p");
		d.innerHTML = this.fallbackmessage;
		this.videoElement.appendChild(d);
		this.videoElement.appendChild(f);
		this.resize(this.inWidth, this.inHeight);
		this.videoElement.load()
	};
	s7sdk.video.HTML5VideoProxy.prototype.getVolume = function() {
		return this.videoElement.volume
	};
	s7sdk.video.HTML5VideoProxy.prototype.setVolume = function(a) {
		if (this.videoElement.muted) {
			this.videoElement.muted = false
		}
		this.videoElement.volume = a
	};
	s7sdk.video.HTML5VideoProxy.prototype.mute = function(a) {
		this.videoElement.muted = a
	};
	s7sdk.video.HTML5VideoProxy.prototype.muted = function() {
		return this.videoElement.muted
	};
	s7sdk.video.HTML5VideoProxy.prototype.getLoadedPosition = function() {
		return ((this.videoElement.buffered && this.videoElement.buffered.length > 0) ? this.videoElement.buffered
				.end(0) * 1000
				: 0)
	};
	s7sdk.video.HTML5VideoProxy.prototype.getDuration = function() {
		if (!this.videoElement || isNaN(this.videoElement.duration)) {
			return undefined
		} else {
			return this.videoElement.duration * 1000
		}
	};
	s7sdk.video.HTML5VideoProxy.prototype.ended = function() {
		if (this.videoElement.ended && (s7sdk.browser.device.name == "ipad")
				&& (s7sdk.browser.device.version == 6)) {
			this.needToReload = true
		}
		return this.videoElement.ended
	};
	s7sdk.video.HTML5VideoProxy.prototype.supportsFullScreen = function() {
		if (("ipad" == s7sdk.browser.device.name)
				|| ("safari" == s7sdk.browser.name)
				|| ("chrome" == s7sdk.browser.name)) {
			return this.videoElement.webkitSupportsFullscreen
		}
		if ("firefox" == s7sdk.browser.name) {
			return document.mozFullScreenEnabled
		}
		return false
	};
	s7sdk.video.HTML5VideoProxy.prototype.enterFullScreen = function() {
		if (this.supportsFullScreen()) {
			if ("firefox" == s7sdk.browser.name) {
				this.videoElement.mozRequestFullScreen()
			}
			if (this.videoElement.webkitSupportsFullscreen) {
				this.videoElement.webkitEnterFullScreen()
			}
		}
	};
	s7sdk.video.HTML5VideoProxy.prototype.resize = function(b, c) {
		var a, d;
		this.inWidth = b;
		this.inHeight = c;
		if (this.videoHeight && this.videoWidth) {
			a = b * this.videoHeight / this.videoWidth;
			if (a > c) {
				d = this.videoWidth * c / this.videoHeight;
				a = c
			} else {
				d = b
			}
		} else {
			a = c;
			d = b
		}
		this.videoElement.width = d * s7sdk.browser.device.pixelratio;
		this.videoElement.height = a * s7sdk.browser.device.pixelratio;
		this.videoElement.style.width = d + "px";
		this.videoElement.style.height = a + "px";
		this.videoElement.style.left = (b - d) / 2 + "px";
		this.videoElement.style.top = (c - a) / 2 + "px"
	};
	s7sdk.video.HTML5VideoProxy.prototype.play = function() {
		if (this.needToReload) {
			this.videoElement.load();
			this.needToReload = false
		}
		this.videoElement.play();
		this.onStateChange()
	};
	s7sdk.video.HTML5VideoProxy.prototype.paused = function() {
		return this.videoElement.paused
	};
	s7sdk.video.HTML5VideoProxy.prototype.pause = function() {
		this.videoElement.pause();
		this.onStateChange()
	};
	s7sdk.video.HTML5VideoProxy.prototype.getCurrentTime = function() {
		return this.videoElement.currentTime * 1000
	};
	s7sdk.video.HTML5VideoProxy.prototype.seek = function(a) {
		if (this.videoElement.readyState > 0) {
			this.videoElement.currentTime = a / 1000
		}
	};
	s7sdk.video.HTML5VideoProxy.prototype.onLoadProgress = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.onCurrentTime = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.onDuration = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.onSeeked = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.onVolume = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.onStateChange = function() {
	};
	s7sdk.video.HTML5VideoProxy.prototype.timerHandler = function() {
		var a = 0;
		if (this.videoElement.buffered && this.videoElement.buffered.length > 0) {
			a = this.videoElement.buffered.end(0)
		}
		if ((!s7sdk.Util.isNull(a)) && (a != this.bufTime)) {
			this.bufTime = a;
			this.onLoadProgress()
		}
		var d = this.videoElement.currentTime;
		if ((!s7sdk.Util.isNull(d)) && (d != this.curTime)) {
			this.curTime = d;
			this.onCurrentTime()
		}
		d = this.videoElement.duration;
		if ((!s7sdk.Util.isNull(d)) && !isNaN(d) && (d != this.videoDuration)) {
			var c = ("android" == s7sdk.browser.device.name)
					&& (4 == s7sdk.browser.device.version);
			if (this.videoElement.readyState == 4) {
				if ((c && d > 1) || !c) {
					this.videoDuration = d;
					this.onDuration()
				}
			}
		}
		var b = this.videoElement.volume;
		if (b != this.volume) {
			this.volume = b;
			this.onVolume()
		}
	}
}
if (!s7sdk.video.FlashVideoProxy) {
	s7sdk.video.FlashVideoProxy = function FlashVideoProxy(n, c, k, m, e, l, d,
			b, i, h) {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "FlashVideoProxy constructor");
		this.viewerReady = false;
		this.seekPosition = 0;
		var a = s7sdk.Util.lib.root.substring(0, s7sdk.Util.lib.root
				.indexOf("/js"));
		if (a != "") {
			a += "/"
		}
		a += "flash/VideoPlayer.swf";
		var f = "videoserverurl=" + l + "&serverurl=" + e + "&autoplay=" + d
				+ "&stagesize=" + k + "," + m + "&smoothing=" + h
				+ "&streaming=true&singleclick=none";
		var g = '<object style="max-width:none; max-height:none;"	classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0"  width="'
				+ k
				+ '" height="'
				+ m
				+ '" 	id="'
				+ c
				+ '" name = "'
				+ c
				+ '" align="middle"> ';
		g += ' <param name="allowScriptAccess" value="always" />';
		g += '<PARAM NAME="movie" VALUE="' + a + '" />';
		g += '<PARAM NAME="flashVars" value="' + f + '"/>';
		g += '<PARAM NAME="quality" VALUE="high" />';
		g += '<PARAM NAME="bgcolor" VALUE="#ffffff" />';
		g += '<PARAM NAME="wmode" VALUE="transparent" />';
		g += '<PARAM NAME="allowScriptAccess" VALUE="always" />';
		g += '<PARAM NAME="allowFullScreen" value="true" />';
		g += ' <embed type="application/x-shockwave-flash"';
		g += ' pluginspage="http://www.adobe.com/go/getflashplayer"';
		g += ' name="' + c + '"';
		g += ' allowScriptAccess="always"';
		g += ' quality="high"';
		g += ' bgcolor="#ffffff"';
		g += ' width="' + k + '"';
		g += ' height="' + m + '"';
		g += ' wmode="transparent"';
		g += ' allowFullScreen="true"';
		g += ' src="' + a + '"';
		g += ' flashVars="' + f + '">';
		g += " </embed>";
		g += " </object>";
		n.innerHTML = g;
		this.callQueue = [];
		this.flash = s7sdk.video.FlashVideoProxy.getSWF(c);
		var j = this;
		this.flash.onCurrentTimeUpdate = function(o) {
			j.onCurrentTime()
		};
		this.flash.onDurationUpdate = function(o) {
			j.onDuration()
		};
		this.flash.onLoadProgressUpdate = function(o) {
			j.onLoadProgress()
		};
		this.flash.onVolumeUpdate = function(o) {
			j.onVolume()
		};
		this.flash.onSeekUpdate = function(o) {
			j.onSeeked()
		};
		this.flash.onCapabilityStateUpdate = function(o) {
			j.onStateChange()
		};
		this.flash.onViewerReady = function() {
			j.viewerReady = true;
			while (j.callQueue.length > 0) {
				var o = j.callQueue[0];
				j.callQueue.splice(0, 1);
				j.flash[o.func].apply(j.flash, o.args)
			}
		};
		this.playback = b;
		this.progressivebitrate = i * 1024
	};
	s7sdk.video.FlashVideoProxy.VIDEO_POLLING_RATE = 100;
	s7sdk.video.FlashVideoProxy.prototype.setAsset = function(b, a) {
		var c = s7sdk.MediaSetParser.resolveVideoAsset(b, this.playback,
				this.progressivebitrate);
		this.protectedCall("setAsset", [ c, a ])
	};
	s7sdk.video.FlashVideoProxy.prototype.getVolume = function() {
		if (this.viewerReady) {
			return this.flash.getVolume()
		} else {
			return 1
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.setVolume = function(a) {
		this.protectedCall("setVolume", [ a ])
	};
	s7sdk.video.FlashVideoProxy.prototype.mute = function(a) {
		this.protectedCall("muteVideo", [ a ])
	};
	s7sdk.video.FlashVideoProxy.prototype.muted = function() {
		if (this.viewerReady) {
			return this.flash.muted()
		} else {
			return false
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.getLoadedPosition = function() {
		if (this.viewerReady) {
			return this.flash.getLoadedPosition()
		} else {
			return 0
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.getDuration = function() {
		if (this.viewerReady && !isNaN(this.flash.getDuration())) {
			return this.flash.getDuration()
		} else {
			return undefined
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.ended = function() {
		if (this.viewerReady) {
			if (isNaN(this.flash.getDuration())) {
				return this.flash.ended()
			} else {
				var a = Math
						.max(this.seekPosition, this.flash.getCurrentTime());
				return a >= this.flash.getDuration()
			}
		} else {
			return false
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.resize = function(a, b) {
		this.protectedCall("resize", [ a, b ]);
		this.flash.style.width = a + "px";
		this.flash.style.height = b + "px"
	};
	s7sdk.video.FlashVideoProxy.prototype.play = function() {
		this.protectedCall("playVideo", [])
	};
	s7sdk.video.FlashVideoProxy.prototype.paused = function() {
		if (this.viewerReady) {
			return this.flash.paused()
		} else {
			return false
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.pause = function() {
		this.protectedCall("pauseVideo", [])
	};
	s7sdk.video.FlashVideoProxy.prototype.getCurrentTime = function() {
		if (this.viewerReady) {
			return this.flash.getCurrentTime()
		} else {
			return 0
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.seek = function(a) {
		this.seekPosition = a;
		this.protectedCall("seekVideo", [ a ])
	};
	s7sdk.video.FlashVideoProxy.prototype.onLoadProgress = function() {
	};
	s7sdk.video.FlashVideoProxy.prototype.onCurrentTime = function() {
	};
	s7sdk.video.FlashVideoProxy.prototype.onDuration = function() {
	};
	s7sdk.video.FlashVideoProxy.prototype.onSeeked = function() {
	};
	s7sdk.video.FlashVideoProxy.prototype.onVolume = function() {
	};
	s7sdk.video.FlashVideoProxy.prototype.onStateChange = function() {
	};
	s7sdk.video.FlashVideoProxy.getSWF = function(a) {
		var b = navigator.userAgent.toLowerCase();
		if (b.indexOf("gecko") != -1) {
			return document.embeds[a]
		} else {
			if (s7sdk.browser.name == "ie") {
				return document.getElementById(a)
			} else {
				return window[a]
			}
		}
	};
	s7sdk.video.FlashVideoProxy.prototype.protectedCall = function(b, a) {
		if (this.viewerReady) {
			this.flash[b].apply(this.flash, a)
		} else {
			this.callQueue.push({
				func : b,
				args : a
			})
		}
	}
}
if (!s7sdk.video.NOOPVideoProxy) {
	s7sdk.video.NOOPVideoProxy = function NOOPVideoProxy(h, e, g, a, i, c, b,
			d, f) {
		s7sdk.Logger.log(s7sdk.Logger.INFO, "NOOPVideoProxy constructor");
		this.inContainer = h;
		this.fallbackmessage = f;
		this.createVideoElement()
	};
	s7sdk.video.NOOPVideoProxy.prototype.createVideoElement = function() {
		this.videoElement = s7sdk.Util.createObj(null, "div", null, null);
		this.inContainer.appendChild(this.videoElement);
		var a = document.createElement("p");
		a.innerHTML = this.fallbackmessage;
		this.videoElement.appendChild(a)
	};
	s7sdk.video.NOOPVideoProxy.VIDEO_POLLING_RATE = 100;
	s7sdk.video.NOOPVideoProxy.prototype.setAsset = function(b, a) {
	};
	s7sdk.video.NOOPVideoProxy.prototype.getVolume = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.setVolume = function(a) {
	};
	s7sdk.video.NOOPVideoProxy.prototype.mute = function(a) {
	};
	s7sdk.video.NOOPVideoProxy.prototype.muted = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.getLoadedPosition = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.getDuration = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.ended = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.supportsFullScreen = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.enterFullScreen = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.resize = function(a, b) {
	};
	s7sdk.video.NOOPVideoProxy.prototype.play = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.paused = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.pause = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.getCurrentTime = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.seek = function(a) {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onLoadProgress = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onCurrentTime = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onDuration = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onSeeked = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onVolume = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.onStateChange = function() {
	};
	s7sdk.video.NOOPVideoProxy.prototype.timerHandler = function() {
	}
};