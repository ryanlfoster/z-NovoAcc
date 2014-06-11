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
if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s*/, "").replace(/\s*$/, "")
	}
}
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(b) {
		for ( var a = 0; a < this.length; a++) {
			if (this[a] === b) {
				return a
			}
		}
		return -1
	}
}
if (!Array.prototype.map) {
	Array.prototype.map = function(e, b) {
		var a = new Array(this.length);
		for ( var c = 0, d = this.length; c < d; c++) {
			if (c in this) {
				a[c] = e.call(b, this[c], c, this)
			}
		}
		return a
	}
}
if (!window.console) {
	window.console = {
		log : function() {
		}
	}
}
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame || function(b, a) {
				window.setTimeout(b, 1000 / 60)
			}
})();
var s7sdk;
if (!s7sdk) {
	s7sdk = {}
} else {
	if (typeof s7sdk != "object") {
		throw new Error(
				"Cannot initialize a root 's7sdk' package. s7sdk is not an object")
	}
}
if (!s7sdk.pkg) {
	s7sdk.pkg = function(b) {
		var c, e, a = window, d = b.toLowerCase().split(".");
		for (c = 0; c < d.length; c++) {
			e = d[c];
			if (!a[e]) {
				a[e] = {}
			}
			a = a[e]
		}
	}
}
if (!s7sdk.Util) {
	s7sdk.Util = {
		write : function(a) {
			document.write(a)
		},
		byId : function(a) {
			return document.getElementById(a)
		},
		getHead : function() {
			return document.getElementsByTagName("head")[0]
		},
		byFirstTag : function(b) {
			var a = document.getElementsByTagName(b);
			if (a.length > 0) {
				return a[0]
			} else {
				return undefined
			}
		},
		wrapContext : function(b, a) {
			return function() {
				b.apply(a, Array.prototype.slice.call(arguments, 0))
			}
		},
		noop : function() {
		},
		byTagAndAttributes : function(f, c) {
			var e, a, g, d = [], b = document.getElementsByTagName(f);
			for (e = 0; e < b.length; e++) {
				g = true;
				for (a in c) {
					if (Object.prototype.hasOwnProperty.call(c, a)
							&& b[e].getAttribute(a) !== c[a]) {
						g = false;
						break
					}
				}
				if (g) {
					d.push(b[e])
				}
			}
			return d
		},
		createElement : function(d, b) {
			var c = document.createElement(d), a;
			for (a in b) {
				if (b.hasOwnProperty(a) && b.propertyIsEnumerable(a)) {
					c.setAttribute(a, b[a])
				}
			}
			return c
		},
		elementInDOM : function(a) {
			while (a = a.parentNode) {
				if (a == document) {
					return true
				}
			}
			return false
		},
		lib : {
			scriptElement : function() {
				var b = null;
				if (document.scripts) {
					b = document.scripts
				} else {
					b = document.getElementsByTagName("script")
				}
				for ( var a = 0; a < b.length; a++) {
					if (b[a].getAttribute("src")
							&& b[a].getAttribute("src").indexOf(
									"s7sdk/utils/Utils.js") > 0) {
						return b[a]
					}
				}
				return null
			}(),
			root : function() {
					return '/etc/designs/dupont/phoenix/s7defaultclientlib/source/js/';
			}(),
			jsList : [],
			isLoaded : function(b) {
				for ( var a = 0; a < s7sdk.Util.lib.jsList.length; a++) {
					if (s7sdk.Util.lib.jsList[a].name == b) {
						return true
					}
				}
				return false
			},
			flagFileLoaded : function(a) {
			},
			flagFile : function(b) {
				for ( var a = 0; a < s7sdk.Util.lib.jsList.length; a++) {
					if (s7sdk.Util.lib.jsList[a].name == b) {
						s7sdk.Util.lib.jsList[a].loaded = true;
						break
					}
				}
			},
			isAllJSLoaded : function() {
				for ( var b = 0; b < s7sdk.Util.lib.jsList.length; b++) {
					if (!s7sdk.Util.lib.jsList[b].loaded) {
						return false
					}
				}
				if (s7sdk.Util.css.defaultCSSText.text.length > 0) {
					var a = s7sdk.Util.createElement("style", {
						type : "text/css",
						media : "screen",
						"data-description" : "Scene7DefaultCSS"
					});
					s7sdk.Util.css.addDefaultStyleCSS(
							s7sdk.Util.css.defaultCSSText.text, a);
					s7sdk.Util.css.defaultCSSText.text = ""
				}
				s7sdk.Event.dispatch(document.body, "S7JSLOAD", false);
				return true
			},
			checkJS : function() {
				if (!s7sdk.Util.lib.isAllJSLoaded()) {
					setTimeout(s7sdk.Util.lib.checkJS, 100)
				}
			},
			addJS : function(b) {
				if (!s7sdk.Util.lib.isLoaded(b)) {
					var a = {
						name : b,
						loaded : false
					};
					s7sdk.Util.lib.jsList.push(a)
				}
			},
			include : function(d, c) {
				var a = s7sdk.Util.lib.parsePkg(d);
				if (typeof c == "undefined") {
					c = true
				}
				if (!s7sdk.Util.lib.isLoaded(d)) {
					if (c) {
						if (s7sdk.Util.byFirstTag("head")) {
							var b = document.createElement("script");
							b.setAttribute("language", "javascript");
							b.setAttribute("type", "text/javascript");
							b.setAttribute("src", s7sdk.Util.lib.root + a
									+ ".js");
							b.setAttribute("id", d);
							if (s7sdk.browser.name != "ie") {
								b.onload = function() {
									s7sdk.Util.lib.flagFile(this.id)
								}
							} else {
								b.onreadystatechange = function() {
									if (this.readyState == "complete"
											|| this.readyState == "loaded") {
										s7sdk.Util.lib.flagFile(this.id)
									}
								}
							}
							s7sdk.Util.byFirstTag("head").appendChild(b);
							s7sdk.Util.lib.addJS(d)
						}
					} else {
						s7sdk.Util
								.write('<script language="javascript" type="text/javascript" src="'
										+ s7sdk.Util.lib.root
										+ a
										+ '.js"><\/script>');
						s7sdk.Util.lib.addJS(d)
					}
				}
			},
			parsePkg : function(a) {
				return a.replace(/\./g, "/")
			}
		},
		css : {
			root : "",
			defaultCSS : "",
			list : {},
			inPageCSS : {
				obj : null,
				classes : []
			},
			defaultCSSText : {
				text : "",
				component : {}
			},
			include : function(b, d, a) {
				a = (typeof a == "boolean") ? a : false;
				var c = s7sdk.Util.createElement("link", {
					media : (d ? d : "all"),
					href : b,
					rel : "stylesheet",
					type : "text/css"
				});
				if ("onreadystatechange" in c) {
					c.onreadystatechange = function() {
						if (c.readyState == "loaded"
								|| c.readyState == "complete") {
							s7sdk.Util.css.list[c.href] = true
						}
					}
				} else {
					if ("onload" in c) {
						c.onload = function() {
							s7sdk.Util.css.list[c.href] = true
						}
					}
				}
				s7sdk.Util.css.list[c.href] = false;
				if (a === true) {
					s7sdk.Util.getHead().appendChild(c)
				} else {
					s7sdk.Util.getHead().insertBefore(c,
							s7sdk.Util.lib.scriptElement.nextSibling)
				}
			},
			checkSheetLoaded : function(a) {
				var d, b;
				for ( var c = 0; c < document.styleSheets.length; c++) {
					d = document.styleSheets[c];
					b = false;
					try {
						b = (s7sdk.browser.name != "ie")
								&& (typeof d.cssRules === "object")
					} catch (f) {
						if ((f.name === "NS_ERROR_DOM_SECURITY_ERR")
								|| (f.name === "SecurityError")) {
							b = true
						}
					}
					if (d.href === a && b) {
						return true
					}
				}
				return false
			},
			isAllLoaded : function() {
				var a, b = s7sdk.Util.css.list;
				for (a in b) {
					if (!b.hasOwnProperty(a)) {
						continue
					}
					if (b[a] === true) {
					} else {
						if (s7sdk.Util.css.checkSheetLoaded(a) === true) {
							b[a] = true
						} else {
							return false
						}
					}
				}
				return true
			},
			add : function(a, b) {
				if (!s7sdk.Util.css.inPageCSS.obj) {
					s7sdk.Util.css.inPageCSS.obj = document
							.createElement("style");
					s7sdk.Util.css.inPageCSS.obj.setAttribute("type",
							"text/css");
					s7sdk.Util.css.inPageCSS.obj.setAttribute("media", "all");
					s7sdk.Util.byFirstTag("head").appendChild(
							s7sdk.Util.css.inPageCSS.obj);
					if (s7sdk.browser.name == "ie") {
						s7sdk.Util.css.inPageCSS.obj.styleSheet.cssText = ""
					} else {
						s7sdk.Util.css.inPageCSS.obj.innerHTML = ""
					}
				}
				if (s7sdk.Util.css.inPageCSS.classes.indexOf(a) < 0) {
					s7sdk.Util.css.inPageCSS.classes.push(a);
					if (s7sdk.browser.name == "ie") {
						s7sdk.Util.css.inPageCSS.obj.styleSheet.cssText += a
								+ "{" + b + "} "
					} else {
						s7sdk.Util.css.inPageCSS.obj.innerHTML += a + "{" + b
								+ "} "
					}
				}
			},
			getCss : function(g, c, d, a, b, f) {
				var e = "";
				var h = s7sdk.Util.createElement("div", f), i;
				b = (b && s7sdk.Util.isElement(b)) ? b : document.body;
				h.className = g;
				if (a) {
					i = s7sdk.Util.createElement("div");
					i.className = a;
					i.appendChild(h)
				}
				if (d && d.length > 0) {
					if (a) {
						i.setAttribute("id", d)
					} else {
						h.setAttribute("id", d)
					}
				}
				b.appendChild(i || h);
				e = s7sdk.Util.getStyle(h, c);
				b.removeChild(i || h);
				return e
			},
			createCssRuleText : function(c, b) {
				var d, a = c + " {\n";
				for (d in b) {
					if (Object.prototype.hasOwnProperty.call(b, d)) {
						a += "\t" + d + ":" + b[d] + ";\n"
					}
				}
				a += " }\n";
				return a
			},
			createCssImgUrlText : function(b) {
				var a = s7sdk.Util.lib.root;
				if (a.substr(a.length - 3, 3) === "js/") {
					a = a.substr(0, a.length - 3) + "images/sdk/"
				} else {
					throw new Error("Unexpected SDK root URL!")
				}
				return "url("+ a + b +")"
			},
			setCSSAttributeSelector : function(a, b, c) {
				a.setAttribute(b, c);
				if (s7sdk.browser.name === "ie") {
					a.className = a.className
				}
			},
			addDefaultStyleCSS : function(c, a) {
				function b() {
					if (!a.parentNode) {
						s7sdk.Util.getHead().insertBefore(a,
								s7sdk.Util.getHead().firstChild)
					}
				}
				var d = document.createTextNode(c);
				if (s7sdk.browser.name === "ie") {
					b()
				}
				if (a.styleSheet && !("textContent" in a)) {
					a.styleSheet.cssText = d.nodeValue
				} else {
					a.appendChild(d)
				}
				b()
			},
			addDefaultCSS : function() {

			},
			createCssAnimationText : function(d, e, c, a) {
				var i = "@-webkit-keyframes " + d + " {\n";
				var g = "@-webkit-keyframes " + d + " {\n";
				var h = "@-webkit-keyframes " + d + " {\n";
				var b = "0% {\n" + e + ":" + c + ";\n}100% {\n" + e + ":" + a
						+ ";\n}\n}";
				i += b;
				g += b;
				h += b;
				var f = (i + g + h);
				return f
			},
			forceCSSEval : function() {
				var b = s7sdk.Util.getHead().childNodes;
				for ( var a = 0; a < b.length; a++) {
					var d = b[a];
					if (d.nodeName.toUpperCase() == "LINK"
							|| d.nodeName.toUpperCase() == "STYLE") {
						var c = d.getAttribute("type");
						d.setAttribute("type", "none");
						if (c) {
							d.setAttribute("type", c)
						} else {
							d.removeAttribute("type")
						}
					}
				}
			}
		},
		require : function(a) {
			//s7sdk.Util.lib.include(a, true)
		},
		addObj : function(a, g, d, c, b) {
			var f = (a == null ? document.body : document.getElementById(a));
			var e = s7sdk.Util.createObj(g, d, c, b);
			f.appendChild(e)
		},
		createObj : function(h, d, c, b) {
			var f = document.createElement(d);
			if (h != null) {
				f.setAttribute("id", h)
			}
			var e = (c == null ? [] : c.split(";"));
			for ( var a = 0; a < e.length; a++) {
				var g = e[a].split(":");
				if (g.length > 1) {
					f.style[s7sdk.Util.cssParse(g[0])] = g[1]
				}
			}
			if (b != null) {
				f.className = b
			}
			return f
		},
		createUniqueId : function() {
			if (!s7sdk.Util.createUniqueId.count) {
				s7sdk.Util.createUniqueId.count = 0
			}
			return (s7sdk.Util.createUniqueId.count++).toString(16)
					.toUpperCase()
		},
		cssParse : function(c) {
			if (c.indexOf("-") < 0) {
				return c
			}
			var b = c.split("-");
			for ( var a = 1; a < b.length; a++) {
				b[a] = b[a].charAt(0).toUpperCase() + b[a].slice(1)
			}
			return b.join("")
		},
		setObjSize : function(c, a, b) {
			if (s7sdk.Util.isNumber(a)) {
				c.style.width = a + "px"
			}
			if (s7sdk.Util.isNumber(b)) {
				c.style.height = b + "px"
			}
		},
		setObjPos : function(b, a, c) {
			if (s7sdk.Util.isNumber(a) && s7sdk.Util.isNumber(c)) {
				b.style.position = "absolute";
				b.style.left = a + "px";
				b.style.top = c + "px"
			}
		},
		getScrollXY : function() {
			var b = 0, a = 0;
			if (s7sdk.browser.device.name == "iphone"
					&& s7sdk.browser.device.version > 3) {
				return {
					x : b,
					y : a
				}
			}
			if (typeof (window.pageYOffset) == "number") {
				a = window.pageYOffset;
				b = window.pageXOffset
			} else {
				if (document.body
						&& (document.body.scrollLeft || document.body.scrollTop)) {
					a = document.body.scrollTop;
					b = document.body.scrollLeft
				} else {
					if (document.documentElement
							&& (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
						a = document.documentElement.scrollTop;
						b = document.documentElement.scrollLeft
					}
				}
			}
			return {
				x : b,
				y : a
			}
		},
		getObjPos : function(d) {
			var a = 0;
			var e = 0;
			var c = 0;
			var b = 0;
			while (d != null) {
				c = s7sdk.Util.getStyle(d, "border-left-width");
				b = s7sdk.Util.getStyle(d, "border-top-width");
				if (s7sdk.Util.isNumber(c) && (c != "")) {
					a += parseInt(c)
				}
				if (s7sdk.Util.isNumber(b) && (b != "")) {
					e += parseInt(b)
				}
				a += d.offsetLeft;
				e += d.offsetTop;
				d = d.offsetParent
			}
			return {
				x : a,
				y : e
			}
		},
		getEventPos : function(b) {
			var a = 0;
			var c = 0;
			if (b.touches) {
				if (b.touches.length > 0) {
					a = b.touches[0].pageX;
					c = b.touches[0].pageY
				} else {
					a = b.changedTouches[0].pageX;
					c = b.changedTouches[0].pageY
				}
			} else {
				if (b.pageX) {
					a = b.pageX;
					c = b.pageY
				} else {
					a = b.clientX + document.documentElement.scrollLeft;
					c = b.clientY + document.documentElement.scrollTop
				}
			}
			return {
				x : a,
				y : c
			}
		},
		canvasPool : [],
		getCanvas : function() {
			s7sdk.Logger.log(s7sdk.Logger.FINEST,
					"getCanvas start pool size %0",
					s7sdk.Util.canvasPool.length);
			if (s7sdk.Util.canvasPool.length < 1) {
				return s7sdk.Util.createObj(null, "canvas", null, null)
			}
			return s7sdk.Util.canvasPool.pop()
		},
		releaseCanvas : function(a) {
			a.width = 0;
			a.height = 0;
			s7sdk.Util.canvasPool.push(a);
			s7sdk.Logger.log(s7sdk.Logger.FINEST,
					"releaseCanvas end pool size %0",
					s7sdk.Util.canvasPool.length)
		},
		clearMatte : function(e, d, b, i, c, g) {
			var a = e.width;
			var f = e.height;
			d.clearRect(0, 0, b, f);
			d.clearRect(b, 0, c, i);
			d.clearRect(b, i + g, c, f - (i + g));
			d.clearRect(b + c, 0, a - (b + c), f)
		},
		isNumberType : function(a) {
			return Object.prototype.toString.apply(a) === "[object Number]"
		},
		isNumber : function(a) {
			return s7sdk.Util.isNumberType(a) && !isNaN(a)
		},
		isNull : function(a) {
			return (typeof a == "undefined" || a == null)
		},
		isArray : function(b) {
			return Object.prototype.toString.apply(b) === "[object Array]"
		},
		isString : function(a) {
			return Object.prototype.toString.apply(a) === "[object String]"
		},
		isBoolean : function(a) {
			return Object.prototype.toString.apply(a) === "[object Boolean]"
		},
		isNonEmptyString : function(a) {
			return s7sdk.Util.isString(a) && a.length > 0
		},
		isElement : function(a) {
			try {
				return a instanceof HTMLElement
			} catch (b) {
				return (a.nodeType === 1) && (typeof a === "object")
						&& (typeof a.style === "object")
						&& (typeof a.ownerDocument === "object")
			}
		},
		checkDefault : function(b, a) {
			return (s7sdk.Util.isNull(b) || b === "") ? a : b
		},
		checkDefaultText : function(b, a) {
			return s7sdk.Util.isNull(b) ? a : b
		},
		getStyle : function(c, d) {
			var b = "";
			if (window.getComputedStyle) {
				b = document.defaultView.getComputedStyle(c, null)
						.getPropertyValue(d)
						+ ""
			} else {
				if (c.currentStyle) {
					var a = /(\-([a-z]){1})/g;
					if (d == "float") {
						d = "styleFloat";
						if (a.test(d)) {
							d = d.replace(a, function() {
								return arguments[2].toUpperCase()
							})
						}
					} else {
						if (d == "opacity") {
							return c.filters.alpha ? (c.filters.alpha.opacity / 100)
									: 1
						}
					}
					b = c.currentStyle[s7sdk.Util.cssParse(d)] ? c.currentStyle[s7sdk.Util
							.cssParse(d)]
							+ ""
							: null
				} else {
					b = c.style[d] + ""
				}
			}
			if (b && b.indexOf("url(") == 0) {
				b = b.replace('url("', "");
				b = b.replace('")', "");
				b = b.replace("url(", "");
				b = b.replace(")", "")
			}
			return b
		},
		setOpacity : function(a, b) {
			if (b < 0) {
				b = 0
			}
			if (b > 0.99) {
				b = 0.999999
			}
			a.style.opacity = b;
			if (s7sdk.browser.name == "ie") {
				if ((s7sdk.browser.version.minor > 5.5)
						&& (s7sdk.browser.version.minor <= 8)
						&& (document.body.filters)) {
					if (a.filters) {
						if (a.filters.length > 0) {
							if (a.filters["DXImageTransform.Microsoft.Alpha"]) {
								a.filters
										.item("DXImageTransform.Microsoft.Alpha").Opacity = Math
										.round(b * 100)
							} else {
								a.style.filter += " progid:DXImageTransform.Microsoft.Alpha(opacity="
										+ Math.round(b * 100) + ")"
							}
						} else {
							a.style.filter = " progid:DXImageTransform.Microsoft.Alpha(opacity="
									+ Math.round(b * 100) + ")"
						}
					}
				}
			}
		},
		convertColor : function(e, l) {
			if (e && e.length > 0 && l && l.length > 0) {
				var h = e.indexOf("rgb") == 0;
				var c = e.indexOf("#") == 0;
				var i = e.indexOf("0x") == 0;
				if ((h && l == "rgb") || (c && l == "hex")
						|| (i && l == "flash")) {
					return e
				} else {
					if (h) {
						var d = e.replace("rgb", "");
						d = d.replace("(", "");
						d = d.replace(")", "");
						var j = d.split(",");
						var a = parseInt(j[0]);
						var f = parseInt(j[1]);
						var k = parseInt(j[2]);
						a = a.toString(16);
						f = f.toString(16);
						k = k.toString(16);
						a = (a.length == 1 ? "0" : "") + a;
						f = (f.length == 1 ? "0" : "") + f;
						k = (k.length == 1 ? "0" : "") + k;
						return (l == "hex" ? "#" : "0x") + a + f + k
								+ (l == "flash" ? "FF" : "")
					} else {
						if (l == "rgb") {
							var d = e.replace("#", "");
							d = d.replace("0x", "");
							d = d.substring(0, 6);
							var a = parseInt(d.substring(0, 2), 16);
							var f = parseInt(d.substring(2, 4), 16);
							var k = parseInt(d.substring(4, 6), 16);
							a = (!s7sdk.Util.isNumber(a) || a < 0 ? 0
									: (a > 255 ? 255 : a));
							f = (!s7sdk.Util.isNumber(f) || f < 0 ? 0
									: (f > 255 ? 255 : f));
							k = (!s7sdk.Util.isNumber(k) || k < 0 ? 0
									: (k > 255 ? 255 : k));
							return "rgb(" + a + "," + f + "," + k + ")"
						} else {
							if (l == "hex") {
								var d = d.replace("0x", "");
								return "#" + d.substring(0, 6)
							} else {
								var d = e.replace("#", "");
								return "0x" + d + "FF"
							}
						}
					}
				}
			} else {
				return e
			}
		},
		fade : function(h, b, d, g, f, e, c) {
			if (typeof e == "undefined" && b) {
				e = s7sdk.Util.getStyle(h, "opacity");
				e = (!e || e == null || e.length == 0 ? 1 : parseFloat(e))
			} else {
				if (typeof e == "undefined" && !b) {
					e = 1
				}
			}
			if (typeof f == "undefined" && b) {
				f = e
			} else {
				if (typeof f == "undefined" && !b) {
					f = 0
				}
			}
			var a = f + (b ? -1 : 1) * 0.05 / d;
			if (!b) {
				h.style.display = g
			}
			if (a > 0 && a < 1) {
				h.style.opacity = e * a;
				s7sdk.Util
						.timeout(s7sdk.Util.fade, 50, [ h, b, d, g, a, e, c ])
			} else {
				if (a >= 1) {
					h.style.opacity = 1;
					if (typeof (c) != "undefined") {
						c()
					}
				} else {
					if (a <= 0) {
						h.style.display = "none";
						if (typeof (c) != "undefined") {
							c()
						}
					}
				}
			}
		},
		isAbsPath : function(a) {
			return (a && ((a.indexOf("http://") == 0) || (a.indexOf("https://") == 0)))
		},
		stripWhiteSpace : function(a) {
			return a.replace(/[\s\t]+/g, "")
		},
		resizeToFitScreen : function(a) {
			if (a) {
				s7sdk.browser.screensize = s7sdk.browser.detectScreen();
				a
						.resize(s7sdk.browser.screensize.w,
								s7sdk.browser.screensize.h)
			}
		},
		adjustDevicePixelRatio : function(d, c, b) {
			var a;
			if (d == -1 || d == NaN) {
				a = s7sdk.Util.hasProperty(window, "devicePixelRatio") ? window.devicePixelRatio
						: 1
			} else {
				if (d == 0) {
					a = 1
				} else {
					if (d > 0) {
						a = s7sdk.Util.hasProperty(window, "devicePixelRatio") ? window.devicePixelRatio
								: 1;
						if (a > 1 && (a * b * a * c > d)) {
							a = 1
						}
					}
				}
			}
			return a
		},
		hasProperty : function(a, b) {
			return Boolean(b in a)
		},
		timeout : function(c, b, a) {
			var d = function() {
				c.apply(this, a)
			};
			return setTimeout(d, b)
		},
		interval : function(c, b, a) {
			var d = function() {
				c.apply(this, a)
			};
			return setInterval(d, b)
		},
		async : function(c, b, a) {
			setTimeout(function() {
				c.apply(b, a || [])
			}, 0)
		},
		init : function() {
			s7sdk.Util.lib.checkJS()
		}
	}
}
if (!s7sdk.DEVICE) {
	s7sdk.DEVICE = [
			[ /iPhone/i, "iphone", [ [ /OS 3/i, "3" ], [ /OS 4/i, "4" ] ], "" ],
			[ /iPod/i, "ipod", [], "" ],
			[
					/iPad/i,
					"ipad",
					[ [ /OS 3/i, "3" ], [ /OS 4/i, "4" ], [ /OS 5/i, "5" ],
							[ /OS 6/i, "6" ] ], "" ],
			[ /Android/i, "android",
					[ [ /Android 3/i, "3" ], [ /Android 4/i, "4" ] ], "2" ],
			[ /Symbian/i, "symbian", [], "" ],
			[ /(BlackBerry|BB10|PlayBook)/i, "blackberry",
					[ [ /BB10/i, "10" ] ], "" ], [ /Palm/i, "palm", [], "" ],
			[ /Windows CE; PPC/i, "pocketpc", [], "" ] ]
}
if (!s7sdk.OS) {
	s7sdk.OS = [ [ /Win/i, "win" ], [ /Android/i, "android" ],
			[ /Mac/i, "mac" ], [ /(iPhone|iPad)/i, "ios" ],
			[ /(BlackBerry|BB10|PlayBook)/i, "blackberry" ] ]
}
if (!s7sdk.browser) {
	s7sdk.browser = {
		raw : {
			ua : navigator.userAgent.toLowerCase(),
			ver : navigator.appVersion.toLowerCase()
		},
		name : "undefined",
		version : {
			major : "0",
			minor : "0",
			js : "0"
		},
		device : {
			name : "",
			version : "",
			pixelratio : 1
		},
		os : "undefined",
		screensize : {
			w : 0,
			h : 0
		},
		supportflash : function() {
			if (navigator.plugins != null && navigator.plugins.length > 0) {
				if (navigator.plugins["Shockwave Flash"]) {
					return true
				}
			} else {
				if ((this.name == "msie")
						|| (this.name == "ie")
						&& (navigator.appVersion.toLowerCase().indexOf("win") != -1)) {
					try {
						var a = new ActiveXObject(
								"ShockwaveFlash.ShockwaveFlash");
						if (a) {
							return true
						}
					} catch (b) {
					}
				}
			}
			return false
		},
		detectdevice : function() {
			var f = "desktop";
			var e = "";
			for ( var d = 0; d < s7sdk.DEVICE.length; d++) {
				if (navigator.userAgent.match(s7sdk.DEVICE[d][0])) {
					f = s7sdk.DEVICE[d][1];
					e = s7sdk.DEVICE[d][3];
					var b = s7sdk.DEVICE[d][2];
					for ( var c = 0; c < b.length; c++) {
						var a = b[c];
						if (navigator.userAgent.match(a[0])) {
							e = a[1];
							break
						}
					}
					break
				}
			}
			this.device.name = f;
			this.device.version = e;
			if (this.device.name == "iphone") {
				this.device.version = this.fixiphone(this.device.version)
			}
			if (typeof window.devicePixelRatio != "undefined") {
				this.device.pixelratio = window.devicePixelRatio
			}
		},
		detectos : function() {
			for ( var a = 0; a < s7sdk.OS.length; a++) {
				if (navigator.userAgent.match(s7sdk.OS[a][0])) {
					this.os = s7sdk.OS[a][1]
				}
			}
		},
		fixiphone : function(a) {
			if (window.devicePixelRatio < 2) {
				return 3
			}
			return a
		},
		init : function() {
			var d = this.raw.ua;
			var a = this.raw.ver;
			this.version.minor = parseFloat(a);
			this.version.major = parseInt(this.version.minor);
			if (d.indexOf("opera") > -1) {
				this.name = "opera";
				if (this.version.major == 5 || this.version.major == 6) {
					this.version.js = "1.3"
				} else {
					if (this.version.major >= 7) {
						this.version.js = "1.5"
					} else {
						this.version.js = "1.1"
					}
				}
			} else {
				if (d.indexOf("chrome") > -1) {
					this.name = "chrome";
					this.version.js = "1.5"
				} else {
					if (d.indexOf("safari") > -1 && d.indexOf("mac") > -1) {
						this.name = "safari";
						this.version.js = "1.5"
					} else {
						if (d.indexOf("applewebkit") > -1
								&& d.indexOf("mobile") > -1) {
							this.name = "safari";
							this.version.js = "1.5"
						} else {
							if (d.indexOf("konqueror") > -1) {
								var g = d.indexOf("konqueror");
								this.name = "konquerer";
								this.version.minor = parseFloat(d.substring(
										g + 10, d.indexOf(";", g)));
								this.version.major = parseInt(this.version.minor);
								this.version.js = "1.5"
							} else {
								if (navigator.product
										&& navigator.product.toLowerCase() == "gecko") {
									if (d.indexOf("mozilla/5") > -1
											&& d.indexOf("spoofer") == -1
											&& d.indexOf("compatible") == -1
											&& d.indexOf("webtv") == -1
											&& d.indexOf("hotjava") == -1) {
										if (navigator.vendor == "Firebird") {
											this.name = "firebird"
										} else {
											if (d.indexOf("navigator") > -1) {
												this.name = "netscape"
											} else {
												if (navigator.vendor == "Firefox"
														|| d.indexOf("firefox") > -1) {
													this.name = "firefox"
												} else {
													if (navigator.vendor == ""
															|| navigator.vendor == "Mozilla"
															|| navigator.vendor == "Debian") {
														this.name = "mozilla"
													} else {
														if (navigator.vendor
																.indexOf("Google") > -1) {
															this.name = "mozilla"
														}
													}
												}
											}
										}
										if (this.name != "undefined"
												&& this.name != "netscape") {
											var b = (navigator.vendorSub) ? navigator.vendorSub
													: 0;
											var f;
											if (this.name == "firefox" && !b) {
												b = parseFloat(d
														.substring(d
																.indexOf("firefox/") + 8))
											} else {
												if (!b) {
													b = d
															.substring(d
																	.substring("rv:") + 3);
													f = b.indexOf(")");
													b = parseFloat(b.substring(
															0, f))
												}
											}
											this.version.minor = b;
											this.version.major = parseInt(b);
											this.version.js = "1.5"
										} else {
											if (this.name == "netscape") {
												var e = d.indexOf("navigator");
												this.version.minor = parseFloat(d
														.substring(e + 10,
																e + 13));
												this.version.major = parseInt(this.version.minor);
												this.version.js = "1.5"
											}
										}
									}
								} else {
									if (d.indexOf("mozilla") > -1
											&& d.indexOf("spoofer") == -1
											&& d.indexOf("compatible") == -1
											&& d.indexOf("webtv") == -1
											&& d.indexOf("hotjava") == -1) {
										this.name = "netscape";
										if (navigator.vendor
												&& (navigator.vendor == "Netscape6" || navigator.vendor == "Netscape")) {
											this.version.minor = parseFloat(navigator.vendorSub);
											this.version.major = parseInt(navigator.vendorSub)
										}
										if (this.version.major == 2) {
											this.version.js = "1.0"
										} else {
											if (this.version.major == 3) {
												this.version.js = "1.1"
											} else {
												if (this.version.major == 4) {
													this.version.js = (this.version.minor <= 4.05 ? "1.2"
															: "1.3")
												} else {
													if (this.version.major == 5) {
														this.version.js = "1.4"
													} else {
														if (this.version.major >= 6) {
															this.version.js = "1.5"
														}
													}
												}
											}
										}
									} else {
										if (d.indexOf("msie") > -1) {
											this.name = "ie";
											if (d.indexOf("mac") > -1) {
												var c = d.indexOf("msie");
												this.version.minor = parseFloat(d
														.substring(c + 5,
																d.indexOf(";",
																		c)))
											} else {
												var c = a.indexOf("msie");
												this.version.minor = parseFloat(a
														.substring(c + 5,
																a.indexOf(";",
																		c)))
											}
											this.version.major = parseInt(this.version.minor);
											if (this.version.major < 4) {
												this.version.js = "1.0"
											} else {
												if (this.version.major == 4) {
													this.version.js = "1.2"
												} else {
													if (this.version.major >= 5
															&& d.indexOf("mac") > -1) {
														this.version.js = "1.4"
													} else {
														if (this.version.major >= 5) {
															this.version.js = "1.3"
														}
													}
												}
											}
										} else {
											if (d.indexOf("aol") > -1) {
												this.name = "aol"
											} else {
												if (d.indexOf("webtv") > -1) {
													this.name = "webtv"
												} else {
													if (d.indexOf("hotjava") > -1) {
														this.name = "hotjava";
														if (this.version.major >= 3) {
															this.version.js = "1.4"
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			this.detectdevice();
			this.detectos();
			this.screensize = this.detectScreen()
		},
		detectScreen : function() {
			var a = {
				w : 0,
				h : 0
			};
			if (self.innerHeight) {
				a.w = self.innerWidth;
				a.h = self.innerHeight
			} else {
				if (document.documentElement
						&& document.documentElement.clientHeight) {
					a.w = document.documentElement.clientWidth;
					a.h = document.documentElement.clientHeight
				} else {
					if (document.body) {
						a.w = document.body.clientWidth;
						a.h = document.body.clientHeight
					}
				}
			}
			return a
		},
		isNoScreenSize : function() {
			this.screensize = this.detectScreen();
			return (this.screensize.w == 0 || this.screensize.h == 0)
		}
	};
	s7sdk.browser.init()
}
if (!s7sdk.query) {
	s7sdk.query = {
		qs : "",
		params : {},
		init : function() {
			this.qs = window.location.search;
			this.qs = this.qs.substring(1, this.qs.length);
			var d = this.qs.split("&");
			for ( var b = 0; b < d.length; b++) {
				var a = "";
				var c = null;
				if (d[b].indexOf("=") >= 0) {
					a = d[b].substring(0, d[b].indexOf("="));
					a = s7sdk.query.fixKey(a);
					c = decodeURIComponent(d[b]
							.substring(d[b].indexOf("=") + 1))
				} else {
					a = s7sdk.query.fixKey(d[b])
				}
				this.params[a] = c
			}
		},
		getValue : function(a, b) {
			var d = b;
			var c = s7sdk.query.fixKey(a);
			if (this.params[c]) {
				d = this.params[c]
			}
			return d
		},
		fixKey : function(b) {
			var d = "";
			var a = b.split(".");
			if (a.length > 1) {
				for ( var c = 0; c < a.length - 1; c++) {
					d += a[c] + "."
				}
				d += a[a.length - 1].toLowerCase()
			} else {
				d = b.toLowerCase()
			}
			return d
		}
	};
	s7sdk.query.init()
}
if (!s7sdk.Class) {
	s7sdk.Class = new function() {
		var f = [];
		var d = [];
		this.inherits = function(g, l) {
			var n = false, o, i;
			if (!s7sdk.Util.isString(g) || !s7sdk.Util.isString(l)) {
				throw new Error(
						"s7sdk.Class.inherit requires string parameters!")
			}
			i = g;
			g = b(g);
			o = l;
			l = b(l);
			if (typeof l === "undefined" || l.inheritancePending) {
				g.inheritancePending = true;
				f.push(function j() {
					s7sdk.Class.inherits(i, o)
				})
			} else {
				p(g, l);
				g.inheritancePending = false;
				n = true
			}
			function p(s, r) {
				var u = function q() {
				}, t;
				u.prototype = r.prototype;
				t = {};
				a(s.prototype, t);
				s.prototype = new u();
				s.prototype.constructor = s;
				s.prototype.superproto = r.prototype;
				s.prototype.superclass = r;
				s.superclass = r;
				a(t, s.prototype)
			}
			for ( var m = d.length - 1; m > -1; --m) {
				var h = d[m];
				if (!h.objName || !h.fnName || !h.fn) {
					continue
				}
				if (h.objName == i) {
					var k = b(h.objName);
					c(k, h.fnName, h.fn);
					d.splice(m, 1)
				}
			}
			return n
		};
		this.override = function(h, j, g) {
			var i = b(h);
			if (typeof i === "undefined") {
				throw new Error(
						"Object must be defined before calling override.")
			}
			if (typeof g != "function") {
				throw new Error(
						"A function is required to override a base function.")
			}
			if (i.inheritancePending) {
				d.push({
					objName : h,
					fnName : j,
					fn : g
				})
			} else {
				c(i, j, g)
			}
		};
		function c(h, i, g) {
			if (!h.prototype[i] || typeof h.prototype[i] != "function") {
				s7sdk.Logger
						.log(
								s7sdk.Logger.WARNING,
								"s7sdk.Class.override: base function %0 does not exist.",
								i)
			}
			g.parent = h.prototype[i];
			h.prototype[i] = g
		}
		this.resolveAllPending = function() {
			var g = f.length;
			while (g-- && f.length) {
				e()
			}
			if (f.length) {
				throw new Error("Class.resolveAllPending Inheritance Failure!")
			}
		};
		function e() {
			var h = f;
			f = [];
			for ( var g = 0; g < h.length; g++) {
				h[g].apply(null, [])
			}
		}
		function b(i) {
			var h = window, g = i.split(".");
			while (g.length && typeof h !== "undefined") {
				h = h[g.shift()]
			}
			return h
		}
		function a(g, h) {
			for ( var i in g) {
				if (g.hasOwnProperty(i) && g.propertyIsEnumerable(i)) {
					h[i] = g[i]
				}
			}
		}
	}
}
if (!s7sdk.Base) {
	s7sdk.Base = function Base(e, b, c, a, d) {
		this.id = e;
		this.pid = b;
		this.nt = c;
		this.cl = (typeof a == "string") ? a : "";
		this.settings = d;
		this.obj = null;
		this.events = new Object();
		this.trackingManager = null
	};
	s7sdk.Base.prototype.symbols = null;
	s7sdk.Base.prototype.createElement = function() {
		var a = (typeof this.id == "string" && this.id.length);
		var b = a ? document.getElementById(this.id) : null;
		if (b) {
			this.obj = b;
			this.nt = b.tagName
		} else {
			this.obj = document.createElement(this.nt);
			if (a) {
				this.obj.setAttribute("id", this.id)
			}
		}
		this.obj.className = this.cl;
		this.obj.s7base = this;
		if (!s7sdk.Util.isNull(this.settings)
				&& !s7sdk.Util.isNull(this.settings.locale)) {
			this.obj.setAttribute("lang", this.settings.locale)
		}
		return this.obj
	};
	s7sdk.Base.prototype.getParent = function() {
		return (this.pid == null ? document.body : document
				.getElementById(this.pid))
	};
	s7sdk.Base.prototype.getParam = function(c, d) {
		var b;
		var a = this.getClassName();
		if (this.settings && typeof this.settings.get == "function") {
			b = this.settings.get.apply(this.settings, [ c, d, a, this.id ])
		} else {
			b = d
		}
		return b
	};
	s7sdk.Base.prototype.addEventListener = function(e, d, a) {
		if (!e) {
			throw new Error("Invalid event type!")
		}
		a = (typeof a == "boolean" && a);
		if (!s7sdk.Util.hasProperty(this.events, e)) {
			this.events[e] = [];
			this.events[e].indexOfHandler = function(h, f) {
				function g(j, i) {
					return (j.handler === h && j.useCapture == f) ? i : -1
				}
				return Math.max.apply(null, this.map(g))
			}
		}
		var b = this.hasEventListener(e, d, a);
		if (!b) {
			this.events[e].push({
				handler : d,
				useCapture : a
			});
			if (this.obj.addEventListener) {
				this.obj.addEventListener(e, d, a)
			} else {
				if (this.obj.attachEvent) {
					var c = s7sdk.Event.getIEEvent(e) || "onpropertychange";
					s7sdk.Logger.log(s7sdk.Logger.FINEST,
							"Registered S7Event is %0 , IE Event is %1", e, c);
					if (c == "onpropertychange") {
						this.obj.handler = this.obj.handler || {};
						this.obj.handler[e] = this.obj.handler[e] || [];
						this.obj.handler[e].push(d);
						this.obj.attachEvent(c, function(h) {
							h = h || window.event;
							var g = h.srcElement.handler[h.s7eventName];
							if (g) {
								var f = g.indexOf(d);
								if ((f > -1) && (e == h.s7eventName)) {
									g[f](h)
								}
							}
						})
					} else {
						this.obj.attachEvent(c, d)
					}
				}
			}
		}
	};
	s7sdk.Base.prototype.removeEventListener = function(d, c, a) {
		a = (typeof a == "boolean" && a);
		var b = this.events[d] ? this.events[d].indexOfHandler(c, a) : -1;
		if (b >= 0) {
			if (this.obj.removeEventListener) {
				this.obj.removeEventListener(d, c, a);
				this.events[d].splice(b, 1);
				if (!this.events[d].length) {
					delete this.events[d]
				}
			} else {
				if (this.obj.handler && this.obj.handler[d]) {
					delete this.obj.handler[d]
				}
			}
		}
	};
	s7sdk.Base.prototype.hasEventListener = function(c, b, a) {
		return this.events[c] ? this.events[c].indexOfHandler(b, a) >= 0
				: false
	};
	s7sdk.Base.prototype.dispatchEvent = function(a) {
		s7sdk.Event.dispatch(this.obj, a)
	};
	s7sdk.Base.prototype.disableEvent = function(d) {
		if (d == null) {
			for ( var c in this.events) {
				for ( var a = 0; a < this.events[c].length; a++) {
					if (c == "onpropertychange") {
						continue
					}
					if (this.obj.removeEventListener) {
						this.obj.removeEventListener(c,
								this.events[c][a].handler,
								this.events[c][a].useCapture)
					} else {
						this.obj.detachEvent("on" + c,
								this.events[c][a].handler)
					}
				}
			}
		} else {
			if (this.events.hasOwnProperty(d)) {
				for ( var b = 0; b < this.events[d].length; b++) {
					if (this.obj.removeEventListener) {
						this.obj.removeEventListener(d,
								this.events[d][b].handler,
								this.events[d][b].useCapture)
					} else {
						this.obj.detachEvent("on" + d,
								this.events[d][b].handler)
					}
				}
			}
		}
	};
	s7sdk.Base.prototype.enableEvent = function(d) {
		if (d == null) {
			for ( var c in this.events) {
				for ( var a = 0; a < this.events[c].length; a++) {
					if (c == "onpropertychange") {
						continue
					}
					if (this.obj.addEventListener) {
						this.obj.addEventListener(c, this.events[c][a].handler,
								this.events[c][a].useCapture)
					} else {
						this.obj.attachEvent("on" + c,
								this.events[c][a].handler)
					}
				}
			}
		} else {
			if (this.events.hasOwnProperty(d)) {
				for ( var b = 0; b < this.events[d].length; b++) {
					if (this.obj.addEventListener) {
						this.obj.addEventListener(d, this.events[d][b].handler,
								this.events[d][b].useCapture)
					} else {
						this.obj.attachEvent("on" + d,
								this.events[d][b].handler)
					}
				}
			}
		}
	};
	s7sdk.Base.prototype.getClassName = function() {
		var c;
		if (this.constructor && this.constructor.name
				&& this.constructor.name.length) {
			c = this.constructor.name
		} else {
			var a = /function\s([^(]{1,})\(/;
			var b = (a).exec((this).constructor.toString());
			if (b && b.length > 1) {
				c = b[1]
			}
		}
		return c
	};
	s7sdk.Base.prototype.getLocalizedText = function(a) {
		var c = "";
		if (!s7sdk.Util.isNull(this.settings)) {
			var d = a;
			var b = a;
			if (!s7sdk.Util.isNull(this.getClassName())) {
				d = this.getClassName() + "." + d;
				if (!s7sdk.Util.isNull(this.id)) {
					b = this.id + "." + d
				}
			}
			c = this.settings.getLocalizedText(b, null);
			if (c == null) {
				c = this.settings.getLocalizedText(d, this.symbols[a])
			}
		}
		return c
	};
	s7sdk.Base.prototype.wrapContext = function(b) {
		var a = this;
		return (function() {
			b.apply(a, arguments)
		})
	}
}
if (!s7sdk.Component) {
	s7sdk.Component = function Component(e, b, c, a, d) {
		arguments.callee.superclass.apply(this, [ e, b, c, a, d ]);
		if (d instanceof s7sdk.ParameterManager) {
			d.registerComponent(this)
		}
		this.parseMods()
	};
	s7sdk.Class.inherits("s7sdk.Component", "s7sdk.Base");
	s7sdk.Component.prototype.parseMods = function() {
		var f, b, g, a, e, d;
		for (f in this.modifiers) {
			if (!this.modifiers.hasOwnProperty(f)) {
				continue
			}
			b = this.modifiers[f];
			try {
				a = this.getParam(f, "");
				if (b.parseParams === false) {
					e = new s7sdk.Modifier([ a ])
				} else {
					e = s7sdk.Modifier.parse(a, b.defaults, b.ranges)
				}
				if (f in this) {
					throw new Error(
							"Cannot add modifier property to component! "
									+ this.getClassName()
									+ " already defines property '" + f + "'!")
				}
				if (e.values.length == 1) {
					this[f] = e.values[0]
				} else {
					if (e.values.length > 1) {
						g = {};
						for (d = 0; d < e.values.length; d++) {
							g[b.params[d]] = e.values[d]
						}
						this[f] = g
					}
				}
			} catch (c) {
				throw new Error("Unable to process modifier: '" + f + "'. " + c)
			}
		}
	}
}
if (!s7sdk.UIComponent) {
	s7sdk.UIComponent = function UIComponent(e, b, c, a, d) {
		arguments.callee.superclass.apply(this, [ e, b, c, a, d ])
	};
	s7sdk.Class.inherits("s7sdk.UIComponent", "s7sdk.Component");
	s7sdk.UIComponent.prototype.resize = function(b, a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "UIComponent.resize %0: %1x%2",
				this.id, b, a)
	}
}
if (!s7sdk.Modifier) {
	s7sdk.Modifier = function(a) {
		this.values = a
	};
	s7sdk.Modifier.parse = function(l, e, a) {
		var g = [];
		if (s7sdk.Util.isArray(e) == false) {
			throw new Error("A valid 'defaults' array must be provided!")
		}
		if (s7sdk.Util.isString(l)) {
			var k = l.trim().split(",");
			for ( var h = 0; h < e.length; h++) {
				if (typeof k[h] == "undefined") {
					k[h] = ""
				}
				k[h] = k[h].trim();
				if (h > k.length - 1 || k[h].length == 0) {
					g[h] = e[h];
					continue
				}
				if (s7sdk.Util.isNumberType(e[h])) {
					g[h] = Number(k[h]);
					if (isNaN(g[h])) {
						throw new Error("The " + d(h)
								+ " parameter should be Number!")
					}
					if (a && a[h] && j(g[h], a[h]) == false) {
						throw new Error("The " + d(h)
								+ " parameter is out of range!")
					}
				} else {
					if (s7sdk.Util.isString(e[h])) {
						g[h] = String(k[h]);
						if (a && s7sdk.Util.isArray(a[h])
								&& b(g[h], a[h]) == false) {
							throw new Error("The " + d(h)
									+ " parameter is not a valid string!")
						}
					} else {
						if (s7sdk.Util.isBoolean(e[h])) {
							var c = k[h].toLowerCase();
							if (c != "1" && c != "true" && c != "false"
									&& c != "0") {
								throw new Error("The " + d(h)
										+ " parameter should be Boolean!")
							}
							g[h] = c == "true" ? true : c == "false" ? false
									: Boolean(Number(c))
						} else {
							g[h] = k[h]
						}
					}
				}
			}
			if (k.length > h) {
				throw new Error("Too many parameters passed!")
			}
		} else {
			throw new Error("A valid 'input' string must be provided!")
		}
		function d(i) {
			return (i + 1) + f(i + 1)
		}
		function f(i) {
			var m = i % 10;
			return (i < 4 || i > 20) ? (m == 1 ? "st" : m == 2 ? "nd"
					: m == 3 ? "rd" : "th") : "th"
		}
		function j(m, o) {
			var p = false, r = o.trim().split(","), q, n;
			for (n = 0; n < r.length; n++) {
				q = r[n].trim().split(":");
				if (Number(q[0]) == m
						|| (q.length == 2
								&& (q[0].length == 0 || m >= Number(q[0])) && (q[1].length == 0 || m <= Number(q[1])))) {
					p = true;
					break
				}
			}
			return p
		}
		function b(p, n) {
			var m = false, q = p.toLowerCase(), o;
			for (o = 0; o < n.length; o++) {
				if (s7sdk.Util.isString(n[o]) == false) {
					throw new Error(
							"String ranges must be specified as strings!")
				}
				if (n[o].toLowerCase().trim() == q) {
					m = true;
					break
				}
			}
			return m
		}
		return new s7sdk.Modifier(g)
	}
}
if (!s7sdk.Event) {
	s7sdk.Event = function() {
	};
	s7sdk.Event.dispatch = function(e, a, b) {
		b = (typeof b == "boolean") ? b : false;
		if (!e) {
			throw new Error("Cannot dispatch event to non-exist target!")
		} else {
			if (!a) {
				throw new Error(
						"Cannot dispatch event without type id or s7event object!")
			}
		}
		if (document.createEvent) {
			var c = document.createEvent("Events");
			if (typeof a != "string") {
				c.s7event = a;
				c.initEvent(a.type, a.bubbles, a.useCapture)
			} else {
				c.initEvent(a, true, false)
			}
			if (b) {
				setTimeout(function() {
					e.dispatchEvent(c)
				}, 0)
			} else {
				e.dispatchEvent(c)
			}
		} else {
			var d = document.createEventObject();
			d.s7event = a;
			d.s7eventName = (typeof a != "string" ? a.type : a);
			if (e.fireEvent) {
				var f = function() {
					if (s7sdk.Util.elementInDOM(e)) {
						e.fireEvent("onpropertychange", d)
					} else {
						document.body.appendChild(e);
						e.fireEvent("onpropertychange", d);
						document.body.removeChild(e)
					}
				};
				if (b) {
					setTimeout(function() {
						f()
					}, 0)
				} else {
					f()
				}
			}
		}
	};
	s7sdk.Event.addEventHandler = function(b, e, c, d, a) {
		a = s7sdk.Util.isNull(a) ? false : a;
		s7sdk.Event.addDOMListener(b, e, function(f) {
			if (!f) {
				f = window.event
			}
			d.apply(s7sdk.Util.isNull(c) ? this : c, [ f ])
		}, a)
	};
	s7sdk.Event.addDOMListener = function(e, c, d, a) {
		if ("addEventListener" in e) {
			e.addEventListener(c, d, a)
		} else {
			if ("attachEvent" in e) {
				var b = s7sdk.Event.getIEEvent(c) || c;
				e.attachEvent(b, d)
			}
		}
	};
	s7sdk.Event.removeDOMListener = function(e, c, d, a) {
		if ("removeEventListener" in e) {
			e.removeEventListener(c, d, a)
		} else {
			if ("detachEvent" in e) {
				var b = s7sdk.Event.getIEEvent(c) || c;
				e.detachEvent(b, d)
			}
		}
	};
	s7sdk.Event.preventDefault = function(a) {
		if (a) {
			if (a.preventDefault) {
				a.preventDefault()
			} else {
				a.returnValue = false
			}
		}
	};
	s7sdk.Event.stopPropagation = function(a) {
		if (a) {
			if (a.stopPropagation) {
				a.stopPropagation()
			} else {
				a.cancelBubble = true
			}
		}
	};
	s7sdk.Event.getTarget = function(a) {
		var b;
		if (!a) {
			var a = window.event
		}
		if (a.target) {
			b = a.target
		} else {
			if (a.srcElement) {
				b = a.srcElement
			}
		}
		if (b && b.nodeType == 3) {
			b = b.parentNode
		}
		return b
	};
	s7sdk.Event.getIEEvent = function(a) {
		return s7sdk.Event.IEEVENT[a]
	};
	s7sdk.Event.TILE_LOADED = "tileLoaded";
	s7sdk.Event.TILE_FAILED = "tileFailed";
	s7sdk.Event.RES_INVALIDATED = "invalidated";
	s7sdk.Event.INIT_COMPLETE = "initComplete";
	s7sdk.Event.VIEW_LOADED = "viewLoaded";
	s7sdk.Event.RENDER = "render";
	s7sdk.Event.ENTER_FRAME = "enterFrame";
	s7sdk.Event.SWIPE = "s7swipe";
	s7sdk.Event.CLICK = "s7click";
	s7sdk.Event.DBLCLICK = "s7dblclick";
	s7sdk.Event.SDK_READY = "sdkReady";
	s7sdk.Event.IEEVENT = {
		mouseover : "onmouseover",
		mouseout : "onmouseout",
		mousedown : "onmousedown",
		mouseup : "onmouseup",
		mousemove : "onmousemove",
		mouseenter : "onmouseenter",
		mouseleave : "onmouseleave",
		mousewheel : "onmousewheel",
		contextmenu : "oncontextmenu",
		click : "onclick",
		dblclick : "ondblclick",
		keydown : "onkeydown",
		keyup : "onkeyup",
		keypress : "onkeypress",
		load : "onload",
		unload : "onunload",
		focus : "onfocus",
		blur : "onblur",
		focusin : "onfocusin",
		focusout : "onfocusout",
		resize : "onresize",
		scroll : "onscroll",
		change : "onchange"
	}
}
if (!s7sdk.ParameterManager) {
	s7sdk.ParameterManager = function ParameterManager(b, a, e, d) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.CONFIG,
						"s7sdk.ParameterManager constructor - config: %0, locale: %1 , modifierMap: %2, defaultCSS: %3",
						b, a, e, d);
		arguments.callee.superclass.call(this, s7sdk.Util.createUniqueId(),
				null, "span");
		this.registeredComponents = [];
		this.params = new Object();
		this.config = (b ? b : null);
		this.eventObj = new Image();
		this.hadCustomSize = false;
		this.createElement();
		this.getParent().appendChild(this.obj);
		this.obj.style.display = "none";
		this.eventObj = this.obj;
		this.loadTracked = false;
		this.i18n = {};
		this.locale = (a ? a : null);
		this.localizedTexts = {};
		this.viewerType = s7sdk.ParameterManager.TYPE;
		this.viewerVersion = "UNKNOWN";
		var c = window.location.href;
		this.viewerName = c.split("?")[0].split("/").pop();
		if (this.viewerName.indexOf(".") > 0) {
			this.viewerName = this.viewerName.split(".")[0]
		}
		this.modifierMap = (s7sdk.Util.isNull(e) ? null : e);
		this.defaultCSS = (s7sdk.Util.isNull(d) ? "" : d);
		this.bulkPush(s7sdk.query.params)
	};
	s7sdk.Class.inherits("s7sdk.ParameterManager", "s7sdk.Base");
	s7sdk.ParameterManager.TYPE = "s7_html5_sdk";
	s7sdk.ParameterManager.prototype.registerComponent = function(a) {
		if (a instanceof s7sdk.Component) {
			this.registeredComponents.push(a)
		} else {
			throw new Error(
					"Cannot register component that is not a sub-class of s7sdk.Component!")
		}
	};
	s7sdk.ParameterManager.prototype.getRegisteredComponents = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.ParameterManager.getRegisteredComponents");
		var a = [];
		for ( var b = 0; b < this.registeredComponents.length; b++) {
			a.push(this.registeredComponents[b])
		}
		return a
	};
	s7sdk.ParameterManager.prototype.setLocalizedTexts = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.ParameterManager.setLocalizedTexts - inObj: %0", b);
		if (typeof b == "object") {
			for ( var a in b) {
				this.localizedTexts[a] = b[a]
			}
		}
	};
	s7sdk.ParameterManager.prototype.addEventListener = function(c, b, a) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.ParameterManager.addEventListener - type: %0, handler: %1, useCapture: %2",
						c,
						b.toString().substring(0, b.toString().indexOf("(")), a);
		s7sdk.Base.prototype.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.ParameterManager.loadConfig = function(e, c) {
		for ( var b in e) {
			if (!e.hasOwnProperty(b)) {
				continue
			}
			c.push(b, e[b]);
			if (b.indexOf("i18n") == 0 && b.split(".").length > 1) {
				var g = "";
				var a = b.split(".");
				for ( var d = 1; d < a.length; d++) {
					g += (g != "" ? "." : "") + a[d]
				}
				c.i18n[g] = e[b]
			}
		}
		c.hadCustomSize = c.get("size", null) != null;
		var f = c.resolveCSSPathFromStyleModifier(c);
		c.remap();
		if (f == null) {
			if (c.defaultCSS != "") {
				s7sdk.Util.css.include(c.defaultCSS)
			} else {
				if (s7sdk.Util.css.defaultCSS != "") {
					s7sdk.Util.css.include(s7sdk.Util.css.defaultCSS)
				}
			}
		} else {
			s7sdk.Util.css.include(f, null, true)
		}
		s7sdk.ParameterManager.checkCSS(c, 0)
	};
	s7sdk.ParameterManager.prototype.init = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE, "s7sdk.ParameterManager.init");
		if (typeof this.params.config != "undefined"
				&& this.params.config != null && this.params.config.length > 0) {
			this.config = (typeof this.params.serverurl != "undefined"
					&& this.params.serverurl != null ? this.params.serverurl
					: "/is/image/");
			this.config += (this.config.lastIndexOf("/") != (this.config.length - 1) ? "/"
					: "")
					+ unescape(this.params.config)
		}
		if (!s7sdk.Util.isNull(this.params.locale)
				&& this.params.locale.length > 0) {
			this.locale = this.params.locale
		} else {
			if (!s7sdk.Util.isNull(this.localizedTexts.defaultLocale)
					&& s7sdk.Util.isNull(this.locale)) {
				this.locale = this.localizedTexts.defaultLocale
			} else {
				if (s7sdk.Util.isNull(this.locale)) {
					this.locale = "en"
				}
			}
		}
		this.populateLocalizedTexts();
		s7sdk.ParameterManager.check(this)
	};
	s7sdk.ParameterManager.prototype.resolveCSSPathFromStyleModifier = function() {
		var b = this.get("style", null);
		if (b == null) {
			return null
		}
		var e = this.get("contentRoot", null);
		var g = this.get("contentURL", "/is/content");
		if (!s7sdk.Util.isAbsPath(b)) {
			var h = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
			var a = null;
			var d = null;
			var f = null;
			var c = (e != null) ? e : g;
			if (c != null) {
				c = c + (c.charAt(c.length - 1) != "/" ? "/" : "");
				a = c.match(h);
				d = a[2] || null;
				f = a[4] || null;
				if ((d) && (f)) {
					if (b.indexOf("/") == 0) {
						b = d + "://" + f + b
					} else {
						b = c + b
					}
				} else {
					b = (b.charAt(0) == "/") ? b.substr(1, b.length - 1) : b;
					b = c + b
				}
			}
		}
		return b == "" ? null : b
	};
	s7sdk.ParameterManager.checkCSS = function(b, a) {
		if (!s7sdk.Util.css.isAllLoaded() && a < 30) {
			s7sdk.Util
					.timeout(s7sdk.ParameterManager.checkCSS, 100, [ b, ++a ])
		} else {
			if (a >= 30) {
				s7sdk.Logger.log(s7sdk.Logger.SEVERE, "Cannot load CSS")
			}
			if (s7sdk.browser.name === "ie") {
			}
			s7sdk.Event.dispatch(b.eventObj, s7sdk.Event.SDK_READY, true);
			var c = b.get("title", "", b.getClassName(), b.id);
			if (c != "") {
				window.document.title = c
			}
		}
	};
	s7sdk.ParameterManager.check = function(c) {
		if (!s7sdk.Util.lib.isAllJSLoaded() || s7sdk.browser.isNoScreenSize()) {
			s7sdk.Util.timeout(s7sdk.ParameterManager.check, 100, [ c ])
		} else {
			s7sdk.Class.resolveAllPending();
			if (c.config != null) {
				var a = new s7sdk.IS();
				a.getHttpReq(c.config + "?req=userdata,json,UTF-8&locale="
						+ c.locale, s7sdk.ParameterManager.loadConfig, null, c)
			} else {
				c.hadCustomSize = c.get("size", null) != null;
				var b = c.resolveCSSPathFromStyleModifier();
				if (b == null) {
					if (c.defaultCSS != "") {
						s7sdk.Util.css.include(c.defaultCSS)
					} else {
						if (s7sdk.Util.css.defaultCSS != "") {
							s7sdk.Util.css.include(s7sdk.Util.css.defaultCSS)
						}
					}
				} else {
					s7sdk.Util.css.include(b, null, true)
				}
				s7sdk.ParameterManager.checkCSS(c, 0)
			}
		}
	};
	s7sdk.ParameterManager.prototype.trackLoad = function(a) {
		if (this.loadTracked) {
			return
		}
		var b = new s7sdk.event.UserEvent(s7sdk.event.UserEvent.LOAD, this
				.createLoadData().split(","), true);
		s7sdk.Event.dispatch(a.obj, b, false);
		this.sendLoadMessage();
		this.loadTracked = true
	};
	s7sdk.ParameterManager.prototype.sendLoadMessage = function() {
		var d = "";
		var c = (new Date()).getTime();
		var g = "";
		for ( var f in this.params) {
			if (typeof f === "string") {
				if ((f.indexOf(".asset") != -1 && f.indexOf(".asset") == f
						.lastIndexOf(".asset"))
						|| (f == "asset")) {
					g = this.params[f]
				}
			}
		}
		var a = (this.params.serverurl) ? this.params.serverurl + "/"
				: "/is/image/";
		var e = (a + g)
				.replace(/%2f|%2F/g, "/")
				.match(
						new RegExp(
								"(http[s]?://[^/]+)?[/]+([^/]+[/]+[^/]+)[/]+([^/]+)[/]+([^\\?]+)[\\?]?",
								"i"));
		if ((e == null) || (e.length < 3)) {
			s7sdk.Logger.log(s7sdk.Logger.WARNING, "Invalid image set.")
		} else {
			while (a.length > 0 && a.lastIndexOf("/") == (a.length - 1)) {
				a = a.substr(0, a.length - 1)
			}
			var b = new Image();
			d = a + "/" + escape(e[3]) + "?req=message&message=,0,LOAD,"
					+ this.viewerType + "," + this.viewerName + ","
					+ this.viewerVersion + "," + s7sdk.Version.version + ",,,"
					+ e[3] + "/" + e[4];
			b.src = d
		}
	};
	s7sdk.ParameterManager.prototype.setViewer = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.ParameterManager.setViewer - inParams: %0", a);
		var b = a.split(",");
		if (b.length == 3) {
			this.viewerType = b[0];
			this.viewerVersion = b[1];
			this.viewerName = b[2]
		}
		if (b.length == 2) {
			this.viewerType = b[0];
			this.viewerVersion = b[1]
		} else {
			s7sdk.Logger.log(s7sdk.Logger.WARNING,
					"Invalid parameter for ParameterManager.setViewer(<inParams>):"
							+ a)
		}
	};
	s7sdk.ParameterManager.prototype.createLoadData = function() {
		var c = window.location.href;
		if (!this.viewerName || this.viewerName.length < 1) {
			this.viewerName = c.split("?")[0].split("/").pop();
			if (this.viewerName.indexOf(".") > 0) {
				this.viewerName = this.viewerName.split(".")[0]
			}
		}
		var d = "", b = "";
		var e = this.get("asset");
		if (!e) {
			e = this.get("asset", "", "MediaSet")
		}
		if (e && e.length > 0) {
			var a = e.indexOf("/");
			if (a > -1) {
				b = e.substring(0, a);
				d = e.substring(a + 1)
			}
		}
		return this.viewerType + "," + this.viewerName + ","
				+ this.viewerVersion + "," + s7sdk.Version.version + "," + b
				+ "," + d
	};
	s7sdk.ParameterManager.prototype.onReady = function() {
	};
	s7sdk.ParameterManager.prototype.getModKey = function(b) {
		var a = b.split(".");
		a[a.length - 1] = a[a.length - 1].toLowerCase();
		return a.join(".")
	};
	s7sdk.ParameterManager.prototype.push = function(a, c) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.ParameterManager.push - key: %0, value: %1", a, c);
		var b = this.getModKey(a);
		if (!s7sdk.Util.isNull(this.modifierMap)
				&& !s7sdk.Util.isNull(this.modifierMap[b])) {
			b = this.modifierMap[b]
		}
		if (!this.params[b]) {
			this.params[b] = c
		}
	};
	s7sdk.ParameterManager.prototype.del = function(a) {
		var b = this.getModKey(a);
		delete this.params[b]
	};
	s7sdk.ParameterManager.prototype.bulkPush = function(b) {
		for ( var a in b) {
			if (!b.hasOwnProperty(a)) {
				continue
			}
			this.push(a, (b.hasOwnProperty(a) ? b[a] : null))
		}
	};
	s7sdk.ParameterManager.prototype.get = function(b, a, c, f) {
		var e;
		var d = b.toLowerCase();
		if (f && this.params[f + "." + d]) {
			e = this.params[f + "." + d]
		} else {
			if (c && this.params[c + "." + d]) {
				e = this.params[c + "." + d]
			} else {
				e = (this.params[d] ? this.params[d] : a)
			}
		}
		return e
	};
	s7sdk.ParameterManager.prototype.toString = function() {
		var b = "ParameterManager: { ";
		for ( var a in this.params) {
			if (this.params.hasOwnProperty(a)) {
				b += a + "=" + this.params[a] + " "
			}
		}
		b += "}";
		return b
	};
	s7sdk.ParameterManager.prototype.getLocalizedText = function(a, b) {
		if (!s7sdk.Util.isNull(this.i18n[a])) {
			return this.i18n[a]
		}
		return b
	};
	s7sdk.ParameterManager.prototype.listSymbols = function() {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.ParameterManager.listSymbols");
		var f = this.getRegisteredComponents();
		var a = {};
		var e = "";
		for ( var d = 0; d < f.length; d++) {
			if (f[d].symbols != null) {
				for ( var c in f[d].symbols) {
					if (this.i18n[f[d].getClassName() + "." + c]) {
						a[f[d].getClassName() + "." + c] = this.i18n[f[d]
								.getClassName()
								+ "." + c]
					} else {
						a[f[d].getClassName() + "." + c] = f[d].symbols[c]
					}
					var b = '"' + f[d].getClassName() + "." + c + '":"'
							+ a[f[d].getClassName() + "." + c] + '"';
					if (e == "") {
						e += b
					} else {
						e += "," + b
					}
				}
			}
		}
		return "{" + e + "}"
	};
	s7sdk.ParameterManager.prototype.populateLocalizedTexts = function() {
		var b = this.localizedTexts[this.locale];
		if (s7sdk.Util.isNull(b)) {
			b = this.localizedTexts[(!s7sdk.Util
					.isNull(this.localizedTexts.defaultLocale) ? this.localizedTexts.defaultLocale
					: "en")]
		}
		for ( var a in b) {
			if (b.hasOwnProperty(a)) {
				this.i18n[a] = b[a]
			}
		}
	};
	s7sdk.ParameterManager.prototype.remap = function() {
		if (this.modifierMap != null) {
			var c = {};
			for ( var b in this.params) {
				if (!this.params.hasOwnProperty(b)) {
					continue
				}
				if (!s7sdk.Util.isNull(this.modifierMap[b])) {
					var a = this.modifierMap[b];
					c[a] = this.params[b]
				} else {
					c[b] = this.params[b]
				}
			}
			this.params = c
		}
	}
}
if (!s7sdk.Color) {
	s7sdk.Color = function(a) {
		this.rawdata = a;
		this.hex = (typeof a == "number" ? a.toString(16) : a);
		this.hex = this.hex.replace("#", "");
		this.hex = this.hex.replace("0x", "");
		this.hex = this.hex.substring(0, 6);
		var b = parseInt(this.hex, 16);
		this.rgb = {
			r : (b >> 16) & 255,
			g : (b >> 8) & 255,
			b : b & 255
		}
	};
	s7sdk.Color.prototype.toString = function() {
		return "RAW:" + this.rawdata + "HEX:" + this.hex
	};
	s7sdk.Color.prototype.hexColor = function() {
		return "#" + this.hex
	};
	s7sdk.Color.prototype.rgbColor = function() {
		return this.rgb
	}
}
if (!s7sdk.Logger) {
	s7sdk.Logger = {
		console : {
			minlink : {
				id : "s7debugmaxlink",
				obj : null,
				pos : {
					x : 5,
					y : 5
				}
			},
			popup : {
				id : "s7debug",
				obj : null,
				pos : {
					x : 5,
					y : 5
				}
			},
			content : {
				id : "s7debugcontent",
				obj : null
			},
			nativeConsole : null
		},
		NONE : -1,
		SEVERE : 0,
		WARNING : 1,
		INFO : 2,
		CONFIG : 3,
		FINE : 4,
		FINER : 5,
		FINEST : 6,
		severity : [ "SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER",
				"FINEST" ],
		traceLevel : -1,
		enablePopup : false,
		enableInline : false,
		init : function() {
			var b = s7sdk.query.getValue("loglevel", "NONE").toUpperCase();
			var c = b.split(",")[0];
			s7sdk.Logger.enablePopup = ((b.split(",").length > 1 ? b.split(",")[1]
					: "NONE") == "POPUP");
			s7sdk.Logger.enableInline = ((b.split(",").length > 1 ? b
					.split(",")[1] : "NONE") == "INLINE");
			var a = s7sdk.Logger[c];
			s7sdk.Logger.traceLevel = (typeof a == "undefined" ? -1 : a);
			if (s7sdk.Logger.traceLevel > -1) {
				if (s7sdk.Logger.enableInline) {
					s7sdk.Logger.inlineDiv = null;
					s7sdk.Util.css
							.add(
									"div.s7debuginline",
									"height:300px;background-color:#FFFFFF;border:1px solid #CCCCCC;overflow:auto;position:relative;bottom:0px;width:100%")
				}
				if (s7sdk.Logger.enablePopup) {
					s7sdk.Util.css
							.add(
									"a.s7debugmaxlink",
									"position:absolute;top:0px;left:0px;font-family:Arial;font-size:10px;font-weight:bold;text-align:center;display:block;height:15px;line-height:15px;width:80px;border:1px dotted #FF6600;color: #FF6600;background-color:#FFFFFF;z-index:1000;text-decoration:none;opacity:0.8;");
					s7sdk.Util.css.add("a.s7debugmaxlink:hover",
							"border:1px solid #FF0000; color:#FF0000;");
					s7sdk.Util.css
							.add(
									"a.s7debugminlink",
									"display:block;width:80px;margin-right:5px;font-family:Arial;font-size:10px;font-weight:bold;color:#FF6600;text-decoration:none;");
					s7sdk.Util.css.add("a.s7debugminlink:hover",
							"color:#FF6600;");
					s7sdk.Util.css
							.add(
									"div.s7debugpopup",
									"position:absolute;width:300px;height:200px;z-index:1000;border:1px solid #CCCCCC;background-color:#CCCCCC;box-shadow:2px 2px 2px #555555;cursor:move;opacity:0.9;border-radius:5px;");
					s7sdk.Util.css
							.add(
									"div.s7debugcontent",
									"width:280px;height:170px;margin: 0 0 0 9px; border:1px solid #CCCCCC;overflow:scroll;background-color:#FFFFFF;cursor:pointer;");
					s7sdk.Util.css.add("div.s7debugheader",
							"width:298px;line-height:20px;clear:both;");
					s7sdk.Util.css
							.add(
									"div.s7debuglabel",
									"width:150px;font-weight:bold;color:#222222;float:left;margin-left:5px;font-family:Arial;font-size:11px;");
					s7sdk.Util.css
							.add("div.s7debugitem",
									"border-bottom:1px dotted #CCCCCC;font:11px Arial;padding:5px 0px 5px 5px;");
					if (window.addEventListener) {
						window.addEventListener("load",
								s7sdk.Logger.createConsole, false)
					} else {
						if (document.attachEvent) {
							window.attachEvent("onload", function() {
								s7sdk.Logger.createConsole()
							})
						}
					}
				}
				if (typeof window.console != "undefined") {
					s7sdk.Logger.console.nativeConsole = function(d) {
						window.console.log(d)
					}
				} else {
					if (typeof console != "undefined"
							&& typeof console.log != "undefined") {
						s7sdk.Logger.console.nativeConsole = function(d) {
							console.log(d)
						}
					} else {
						s7sdk.Logger.console.nativeConsole = function(d) {
						}
					}
				}
			}
		},
		minimize : function(a) {
			s7sdk.Logger.console.popup.obj.style.top = (a ? "-1000px"
					: s7sdk.Logger.console.popup.pos.y + "px");
			s7sdk.Logger.console.minlink.obj.style.top = (a ? s7sdk.Logger.console.minlink.pos.y
					+ "px"
					: "-1000px")
		},
		createConsole : function() {
			var b = document.createElement("a");
			b.className = "s7debugmaxlink";
			b.setAttribute("id", "s7debugmaxlink");
			b.setAttribute("href", "javascript:void(0);");
			b.setAttribute("title", "Click to show trace console");
			b.appendChild(document.createTextNode("+ Show Trace"));
			if (b.addEventListener) {
				b.addEventListener("click", function() {
					s7sdk.Logger.minimize(false)
				}, false)
			} else {
				b.attachEvent("onclick", function() {
					s7sdk.Logger.minimize(false)
				})
			}
			s7sdk.Util.setObjPos(b, s7sdk.Logger.console.minlink.pos.x,
					s7sdk.Logger.console.minlink.pos.y);
			s7sdk.Logger.console.minlink.obj = b;
			document.body.appendChild(b);
			var e = document.createElement("div");
			e.setAttribute("id", "s7debug");
			s7sdk.Util.setObjPos(e, s7sdk.Logger.console.popup.pos.x,
					s7sdk.Logger.console.popup.pos.y);
			e.className = "s7debugpopup";
			if (e.addEventListener) {
				e.addEventListener("mousedown", s7sdk.Logger.drag, false);
				e.addEventListener("mouseup", s7sdk.Logger.drop, false)
			} else {
				e.attachEvent("onmousedown", s7sdk.Logger.drag);
				e.attachEvent("onmouseup", s7sdk.Logger.drop)
			}
			e.dragStart = false;
			e.dragRef = {
				x : 0,
				y : 0
			};
			s7sdk.Logger.console.popup.obj = e;
			var a = document.createElement("div");
			a.setAttribute("align", "right");
			a.className = "s7debugheader";
			var c = document.createElement("div");
			c.className = "s7debuglabel";
			c.setAttribute("align", "left");
			c.appendChild(document.createTextNode("S7 Trace Console"));
			a.appendChild(c);
			var f = document.createElement("a");
			f.setAttribute("href", "javascript:void(0);");
			f.className = "s7debugminlink";
			f.setAttribute("title", "Click to minimize trace console");
			f.onclick = function() {
				s7sdk.Logger.minimize(true)
			};
			f.appendChild(document.createTextNode("- minimize"));
			a.appendChild(f);
			e.appendChild(a);
			var d = document.createElement("div");
			d.setAttribute("id", "s7debugcontent");
			d.nodrag = true;
			d.className = "s7debugcontent";
			e.appendChild(d);
			s7sdk.Logger.console.content.obj = d;
			document.body.appendChild(e);
			s7sdk.Logger.minimize(false)
		},
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
		drag : function(c) {
			var b = s7sdk.Event.getTarget(c);
			var a = (typeof b.nodrag == "undefined" ? false : b.nodrag);
			if (!a) {
				s7sdk.Logger.console.popup.obj.dragStart = true;
				s7sdk.Logger.console.popup.obj.dragRef = s7sdk.Logger.getPos(c);
				if (document.addEventListener) {
					document.addEventListener("mousemove", s7sdk.Logger.move,
							false)
				} else {
					document.attachEvent("onmousemove", s7sdk.Logger.move)
				}
			}
		},
		move : function(c) {
			if (s7sdk.Logger.console.popup.obj.dragStart) {
				var d = s7sdk.Logger.getPos(c);
				var b = d.x - s7sdk.Logger.console.popup.obj.dragRef.x;
				var a = d.y - s7sdk.Logger.console.popup.obj.dragRef.y;
				s7sdk.Logger.console.popup.obj.dragRef = d;
				s7sdk.Logger.console.popup.pos.x = s7sdk.Logger.console.popup.pos.x
						+ b;
				s7sdk.Logger.console.popup.pos.y = s7sdk.Logger.console.popup.pos.y
						+ a;
				s7sdk.Logger.console.popup.obj.style.top = s7sdk.Logger.console.popup.pos.y
						+ "px";
				s7sdk.Logger.console.popup.obj.style.left = s7sdk.Logger.console.popup.pos.x
						+ "px"
			}
		},
		drop : function(b) {
			var a = s7sdk.Event.getTarget(b);
			s7sdk.Logger.console.popup.obj.dragStart = false;
			if (document.addEventListener) {
				document
						.addEventListener("mousemove", s7sdk.Logger.move, false)
			} else {
				document.attachEvent("onmousemove", s7sdk.Logger.move)
			}
		},
		log : function() {
			var h = (arguments.length >= 1 ? arguments[0] : "");
			if (s7sdk.Logger.traceLevel >= h) {
				var c = s7sdk.Logger.severity[h];
				var g = (arguments.length >= 2 ? arguments[1] : "");
				var b = new Array();
				for ( var d = 2; d < arguments.length; d++) {
					b.push(arguments[d])
				}
				g = s7sdk.Logger.parseMacro(g, b);
				var f = (new Date() + " ").substring(0, 34);
				if (s7sdk.Logger.console.content.obj != null) {
					var e = document.createElement("div");
					e.className = "s7debugitem";
					e.appendChild(document.createTextNode(f + " - " + c + ":"
							+ g));
					e.nodrag = true;
					s7sdk.Logger.console.content.obj.appendChild(e);
					s7sdk.Logger.console.content.obj.scrollTop = s7sdk.Logger.console.content.obj.scrollHeight
				}
				if (s7sdk.Logger.enableInline && document.body) {
					if (null == s7sdk.Logger.inlineDiv) {
						s7sdk.Logger.inlineDiv = document.createElement("div");
						s7sdk.Logger.inlineDiv.className = "s7debuginline";
						document.body.appendChild(s7sdk.Logger.inlineDiv)
					}
					var a = s7sdk.Logger.inlineDiv.innerHTML;
					if (a.length > 5000) {
						a = a.substr(0, 5000)
					}
					s7sdk.Logger.inlineDiv.innerHTML = c + ":" + g + "<br>" + a
				}
				if (s7sdk.browser.name != "ie") {
					s7sdk.Logger.console.nativeConsole(f + " - " + c + ":" + g)
				}
			}
		},
		parseMacro : function(e, d) {
			var a = e;
			for ( var b = d.length; b > 0; b--) {
				var c = new RegExp("%" + (b - 1), "g");
				a = a.replace(c, d[b - 1])
			}
			return a
		}
	};
	s7sdk.Logger.init()
}
if (!s7sdk.ImagePool) {
	s7sdk.ImagePool = function() {
		this.freeImages = [];
		this.usedImages = []
	};
	s7sdk.ImagePool.prototype.getImage = function() {
		var a;
		if (this.freeImages.length > 0) {
			a = this.freeImages.pop()
		} else {
			a = new Image()
		}
		this.usedImages.push(a);
		return a
	};
	s7sdk.ImagePool.prototype.releaseImage = function(b) {
		b.height = 1;
		b.width = 1;
		b.onload = function() {
		};
		b.onerror = function() {
		};
		b.onabort = function() {
		};
		var a = this.usedImages.indexOf(b);
		if (a >= 0) {
			this.usedImages.splice(a, 1)
		} else {
			s7sdk.Logger.log(s7sdk.Logger.WARNING,
					"ImagePool.releaseImage with unused image.")
		}
		var a = this.freeImages.indexOf(b);
		if (a >= 0) {
			s7sdk.Logger.log(s7sdk.Logger.SEVERE,
					"ImagePool.releaseImage double release.")
		} else {
			this.freeImages.push(b)
		}
	};
	s7sdk.imagePool = new s7sdk.ImagePool()
}
if (!s7sdk.Window) {
	s7sdk.Window = {
		resizedObjs : [],
		resizeTimeout : null,
		currentSize : {
			w : 0,
			h : 0
		},
		monitorSizeTime : 10000,
		monitorSizeTimeout : 0,
		monitorSizeTimer : null,
		attach : function(b, a) {
			if (typeof a != "string") {
				a = "resize"
			}
			this.resizedObjs.push({
				o : b,
				fn : a
			})
		},
		notfWindowResized : function() {
			s7sdk.browser.screensize = s7sdk.browser.detectScreen();
			if ((s7sdk.browser.name == "ie")
					&& (s7sdk.browser.version.minor > 5.5)
					&& (s7sdk.browser.version.minor <= 8)) {
				s7sdk.Window.ignoreNextResize = true
			}
			s7sdk.Window.sendNotifications()
		},
		sendNotifications : function() {
			for ( var a = 0; a < s7sdk.Window.resizedObjs.length; a++) {
				if (s7sdk.Window.resizedObjs[a]) {
					var c = s7sdk.Window.resizedObjs[a].o;
					var b = s7sdk.Window.resizedObjs[a].fn;
					c[b]
							(s7sdk.browser.screensize.w,
									s7sdk.browser.screensize.h)
				}
			}
		},
		monitorSize : function() {
			s7sdk.browser.screensize = s7sdk.browser.detectScreen();
			if (s7sdk.Window.currentSize.w != s7sdk.browser.screensize.w
					|| s7sdk.Window.currentSize.h != s7sdk.browser.screensize.h) {
				s7sdk.Window.currentSize = s7sdk.browser.screensize;
				s7sdk.Window.sendNotifications()
			}
			if ((new Date()).getTime() > s7sdk.Window.monitorSizeTimeout) {
				clearInterval(s7sdk.Window.monitorSizeTimer);
				s7sdk.Window.monitorSizeTimer = null
			}
		},
		startMonitoringSize : function() {
			s7sdk.Window.monitorSizeTimeout = (new Date()).getTime()
					+ s7sdk.Window.monitorSizeTime;
			if (null == s7sdk.Window.monitorSizeTimer) {
				s7sdk.Window.monitorSizeTimer = window.setInterval(
						s7sdk.Window.monitorSize, 100)
			}
		}
	};
	if (("onorientationchange" in window) && s7sdk.browser.device != "") {
		window.onorientationchange = s7sdk.Window.startMonitoringSize;
		window.onresize = s7sdk.Window.startMonitoringSize
	} else {
		window.onresize = function() {
			if (s7sdk.Window.ignoreNextResize) {
				s7sdk.Window.ignoreNextResize = false;
				return
			}
			if (s7sdk.Window.resizeTimeout) {
				clearTimeout(s7sdk.Window.resizeTimeout)
			}
			s7sdk.Window.resizeTimeout = setTimeout(
					s7sdk.Window.notfWindowResized, 100)
		}
	}
}
if (!s7sdk.TrackingManager) {
	s7sdk.TrackingManager = function TrackingManager(a, c, b) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.TrackingManager constructor - containerId: %0, settings: %1 , compId: %2",
						a, c, b);
		if (null == c) {
			c = new s7sdk.ParameterManager()
		}
		if (null == a) {
			a = "TrackMan" + s7sdk.Util.createUniqueId()
		}
		arguments.callee.superclass.apply(this, [ b, a, "span", null, c ]);
		this.initialized = false;
		this.trackComponents = [];
		this.trackEvents = [];
		this.eventObj = new Image();
		this.hadCustomSize = false;
		this.obj = this.eventObj;
		this.obj.style.display = "none";
		this.eventTable = new Object()
	};
	s7sdk.Class.inherits("s7sdk.TrackingManager", "s7sdk.Component");
	s7sdk.TrackingManager.prototype.modifiers = {
		enableTracking : {
			params : [ "events" ],
			defaults : [ "" ],
			parseParams : false
		},
		disableTracking : {
			params : [ "events" ],
			defaults : [ "" ],
			parseParams : false
		}
	};
	s7sdk.TrackingManager.prototype.initializeComponentEvents = function(c) {
		var g = [];
		if (s7sdk.TrackingManager.AVAILABLE_EVENTS.length < 1) {
			s7sdk.TrackingManager.AVAILABLE_EVENTS = [
					s7sdk.event.UserEvent.SWAP, s7sdk.event.UserEvent.SWATCH,
					s7sdk.event.UserEvent.PAGE, s7sdk.event.UserEvent.PLAY,
					s7sdk.event.UserEvent.PAUSE, s7sdk.event.UserEvent.STOP,
					s7sdk.event.UserEvent.MILESTONE,
					s7sdk.event.UserEvent.HREF, s7sdk.event.UserEvent.ITEM,
					s7sdk.event.UserEvent.TARG, s7sdk.event.UserEvent.LOAD,
					s7sdk.event.UserEvent.ZOOM, s7sdk.event.UserEvent.SPIN,
					s7sdk.event.UserEvent.PAN ]
		}
		var f = this.disableTracking.split(",");
		var b;
		if (f.length > 0 && this.enableTracking.length == 0) {
			b = s7sdk.TrackingManager.AVAILABLE_EVENTS
		} else {
			b = this.enableTracking.split(",")
		}
		if (f.length > 0) {
			for ( var a = 0; a < b.length; a++) {
				var d = b[a];
				if (f.indexOf(d) < 0) {
					g.push(d)
				}
			}
		}
		this.eventTable[c.pid] = g
	};
	s7sdk.TrackingManager.prototype.initializeEvents = function() {
		this.trackEvents = [];
		if (s7sdk.TrackingManager.AVAILABLE_EVENTS.length < 1) {
			s7sdk.TrackingManager.AVAILABLE_EVENTS = [
					s7sdk.event.UserEvent.SWAP, s7sdk.event.UserEvent.SWATCH,
					s7sdk.event.UserEvent.PAGE, s7sdk.event.UserEvent.PLAY,
					s7sdk.event.UserEvent.PAUSE, s7sdk.event.UserEvent.STOP,
					s7sdk.event.UserEvent.MILESTONE,
					s7sdk.event.UserEvent.HREF, s7sdk.event.UserEvent.ITEM,
					s7sdk.event.UserEvent.TARG, s7sdk.event.UserEvent.LOAD,
					s7sdk.event.UserEvent.ZOOM, s7sdk.event.UserEvent.SPIN,
					s7sdk.event.UserEvent.PAN ]
		}
		var c = this.disableTracking.split(",");
		var d;
		if (c.length > 0 && this.enableTracking.length == 0) {
			d = s7sdk.TrackingManager.AVAILABLE_EVENTS
		} else {
			d = this.enableTracking.split(",")
		}
		if (c.length > 0) {
			for ( var a = 0; a < d.length; a++) {
				var b = d[a];
				if (c.indexOf(b) < 0) {
					this.trackEvents.push(b)
				}
			}
		}
		this.initialized = true
	};
	s7sdk.TrackingManager.AVAILABLE_EVENTS = [];
	s7sdk.TrackingManager.modifiers = "";
	s7sdk.TrackingManager.prototype.attach = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.TrackingManager.attach - component: %0", a);
		if (null == a) {
			return
		}
		if (this.trackComponents.indexOf(a) < 0) {
			this.trackComponents.push(a);
			this.initializeComponentEvents(a);
			a.trackingManager = this;
			s7sdk.Event.addEventHandler(a,
					s7sdk.event.UserEvent.NOTF_USER_EVENT, a, this.onUserEvent,
					false)
		}
	};
	s7sdk.TrackingManager.prototype.detach = function(b) {
		s7sdk.Logger.log(s7sdk.Logger.FINE,
				"s7sdk.TrackingManager.detach - component: %0", b);
		if (null == b) {
			return
		}
		b.removeEventListener(s7sdk.event.UserEvent.NOTF_USER_EVENT,
				this.onUserEvent, false);
		var a = this.trackComponents.indexOf(b);
		if (a < 0) {
			return
		}
		this.eventTable[b.pid] = [];
		this.trackComponents = this.trackComponents.splice(a, 1)
	};
	s7sdk.TrackingManager.prototype.onUserEvent = function(a) {
		if (!this.trackingManager) {
			return
		}
		var c = this.trackingManager.eventTable[this.pid];
		if (c.indexOf(a.s7event.trackEvent) == -1) {
			return
		}
		s7sdk.Logger.log(s7sdk.Logger.CONFIG, "onUserEvent "
				+ a.s7event.toString());
		var b = s7sdk.Event.getTarget(a);
		this.trackingManager.callTrackingHandler(this, (b && b.id) ? b.id : "",
				a.s7event.toString())
	};
	s7sdk.TrackingManager.prototype.callTrackingHandler = function(d, b, f) {
		s7sdk.Logger
				.log(
						s7sdk.Logger.FINE,
						"s7sdk.TrackingManager.callTrackingHandler - component: %0, instanceName: %1 , dataString: %2",
						d, b, f);
		var a = d.pid;
		var e = d.cl;
		var c = (new Date()).getTime();
		if (null == b) {
			b = ""
		}
		if ("s7ComponentEvent" in window) {
			s7ComponentEvent(a, e, b, c, f)
		}
	};
	s7sdk.TrackingManager.prototype.parseTrack = function(d, a) {
		var b = d.split(",");
		if (b.length == 1) {
			if ((b[0]).toLowerCase() == "all") {
				this.trackEvents = a ? s7sdk.TrackingManager.AVAILABLE_EVENTS
						.concat() : [];
				return
			}
		}
		if (a) {
			this.trackEvents = []
		}
		for ( var c = 0; c < b.length; c++) {
			var f = b[c].toUpperCase();
			f = f.replace(/^[ \t]+/, "");
			f = f.replace(/[ \t]+$/, "");
			var e = this.AVAILABLE_EVENTS.indexOf(f);
			if (e != -1) {
				if (a) {
					e = this.trackEvents.indexOf(f);
					if (e == -1) {
						this.trackEvents.push(f)
					}
				} else {
					e = this.trackEvents.indexOf(f);
					if (e != -1) {
						this.trackEvents.splice(e, 1)
					}
				}
			}
		}
	}
};