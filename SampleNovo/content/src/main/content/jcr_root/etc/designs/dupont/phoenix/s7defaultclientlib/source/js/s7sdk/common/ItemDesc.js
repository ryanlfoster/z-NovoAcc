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
s7sdk.Util.require("s7sdk.utils.SwatchesParser");
if (!s7sdk.ItemDesc) {
	s7sdk.ItemDesc = function ItemDesc(d, c, a, b) {
		this.parent = d;
		this.type = c;
		this.name = a;
		this.swatch = b
	};
	s7sdk.ItemDesc.prototype.toString = function() {
		return this.name
	}
}
if (!s7sdk.ItemDescType) {
	s7sdk.ItemDescType = {
		UNKNOWN : 0,
		IMG : 1,
		VIDEO : 2,
		IMAGE_SET : 4,
		SPIN_SET : 8,
		ECAT_SET : 16,
		MEDIA_SET : 32,
		EMPTY : 64,
		VIDEO_SET : 128
	};
	s7sdk.ItemDescType.decodeItemDescType = function(a) {
		switch (a) {
		case "img":
			return s7sdk.ItemDescType.IMG;
		case "img_set":
			return s7sdk.ItemDescType.IMAGE_SET;
		case "spin":
			return s7sdk.ItemDescType.SPIN_SET;
		case "video":
			return s7sdk.ItemDescType.VIDEO;
		case "ecat":
			return s7sdk.ItemDescType.ECAT_SET;
		case "media_set":
			return s7sdk.ItemDescType.MEDIA_SET;
		case "empty":
			return s7sdk.ItemDescType.EMPTY;
		case "video_set":
			return s7sdk.ItemDescType.VIDEO_SET
		}
		return s7sdk.ItemDescType.UNKNOWN
	}
}
if (!s7sdk.ImageDesc) {
	s7sdk.ImageDesc = function ImageDesc(m, j, a, o, c, q, h, d, k, e, l, i, g,
			b, p, f, n) {
		arguments.callee.superclass.call(this, m, j, a, o);
		this.isDefault = d;
		this.mod = (typeof (k) == "undefined" ? null : k);
		this.pmod = (typeof (e) == "undefined" ? null : e);
		this.label = l;
		this.width = c;
		this.height = q;
		this.version = h;
		this.maps = i;
		this.targets = g;
		this.userData = b;
		this.mapsuppressed = p;
		this.userdatasuppressed = f;
		this.np = n;
		this.images = null
	};
	s7sdk.Class.inherits("s7sdk.ImageDesc", "s7sdk.ItemDesc")
}
if (!s7sdk.MapDesc) {
	s7sdk.MapDesc = function MapDesc(b, d, f, a, c, e) {
		this.shape = b;
		this.coords = d;
		this.alt = f;
		this.href = a;
		this.rolloverKey = c;
		this.target = e
	}
}
if (!s7sdk.MapDescShape) {
	s7sdk.MapDescShape = {
		SHAPE_RECT : "rect",
		SHAPE_CIRCLE : "circle",
		SHAPE_POLY : "poly"
	}
}
if (!s7sdk.MediaSetDesc) {
	s7sdk.MediaSetDesc = function MediaSetDesc(d, e, c, a, b) {
		arguments.callee.superclass.call(this, d, c, a, b);
		this.level = e;
		this.items = new Array();
		this.maps = null;
		this.targets = null;
		this.userdata = null
	};
	s7sdk.Class.inherits("s7sdk.MediaSetDesc", "s7sdk.ItemDesc")
}
if (!s7sdk.SwatchDesc) {
	s7sdk.SwatchDesc = function SwatchDesc(e, b, c, a, d, f) {
		this.image = e;
		this.color = b;
		this.label = c;
		this.mod = typeof (d) == "undefined" ? null : d;
		this.pmod = typeof (f) == "undefined" ? null : f;
		this.version = a;
		this.asset = null;
		this.frame = -1;
		this.sourceFrame = -1
	}
}
if (!s7sdk.TargetDesc) {
	s7sdk.TargetDesc = function TargetDesc(c, e, d, b, a) {
		this.frameId = e;
		this.index = c;
		this.rect = d;
		this.label = b;
		this.userdata = a
	}
}
if (!s7sdk.VideoDesc) {
	s7sdk.VideoDesc = function VideoDesc(i, f, a, h, j, l, e, c, k, b, d, g) {
		arguments.callee.superclass.call(this, i, f, a, j);
		this.suffix = l;
		this.version = e;
		this.width = c;
		this.height = k;
		this.userData = b;
		this.image = d;
		this.videoType = h;
		this.bitrate = g
	};
	s7sdk.Class.inherits("s7sdk.VideoDesc", "s7sdk.ItemDesc")
}
if (!s7sdk.VideoDescType) {
	s7sdk.VideoDescType = {
		FILE : 0,
		CATALOG_ID : 1,
		PATH : 2
	}
}
if (!s7sdk.MediaSetParser) {
	s7sdk.MediaSetParser = function MediaSetParser() {
	};
	s7sdk.MediaSetParser.parse = function(a, b) {
		return s7sdk.MediaSetParser.parseSet(null, a, 0, null, b)
	};
	s7sdk.MediaSetParser.parseSet = function(f, d, h, e, g) {
		if (g && g.length > 0) {
			d.n += (d.n.indexOf("?") == -1) ? "?" : "&";
			d.n += g
		}
		var a = new s7sdk.MediaSetDesc(f, h, s7sdk.ItemDescType
				.decodeItemDescType(d.type), d.n, e);
		if (s7sdk.Util.isArray(d.item)) {
			var b = d.item;
			for ( var c = 0; c < b.length; ++c) {
				a.items[c] = s7sdk.MediaSetParser.parseItem(a, b[c], h, g)
			}
		} else {
			a.items[0] = s7sdk.MediaSetParser.parseItem(a, d
					.hasOwnProperty("item") ? d.item : d, h, g)
		}
		a.targets = s7sdk.MediaSetParser.parseTargets(d);
		a.maps = s7sdk.MediaSetParser.parseMaps(d);
		a.userdata = d.userdata;
		return a
	};
	s7sdk.MediaSetParser.parseItem = function(b, a, d, c) {
		if (a.v != undefined) {
			return s7sdk.MediaSetParser.parseItemVideo(b, a, d, c)
		} else {
			if (a.set != undefined) {
				return s7sdk.MediaSetParser.parseItemSet(b, a, d, c)
			} else {
				if (a.i != undefined) {
					return s7sdk.MediaSetParser.parseItemImage(b, a, d, c)
				}
			}
		}
	};
	s7sdk.MediaSetParser.parseItemImage = function(l, b, a, p) {
		var n = s7sdk.MediaSetParser.parseSwatch(b, b.iv, p);
		var i = s7sdk.MediaSetParser.parseMaps(b);
		var g = s7sdk.MediaSetParser.parseTargets(b);
		var o = (b.map == "1");
		var f = (b.userdata == "1");
		var m = (b.np == "1");
		if (s7sdk.Util.isArray(b.i)) {
			var h = new Array();
			var e = new Array();
			for ( var d = 0; d < b.i.length; ++d) {
				h.push(new s7sdk.ImageDesc(null, s7sdk.ItemDescType.IMG,
						b.i[d].n, null, parseInt(b.dx), parseInt(b.dy), b.iv,
						b.i[d].isDefault, b.i[d].mod, b.i[d].pmod, b.i[d].l,
						null, null, null, false, false, false));
				e.push(b.i[d].n)
			}
			var k = new s7sdk.ImageDesc(l,
					b.type == undefined ? s7sdk.ItemDescType.IMG
							: s7sdk.ItemDescType.decodeItemDescType(b.type),
					b.i[0].n, n, parseInt(b.dx), parseInt(b.dy), b.iv,
					b.i[0].isDefault, b.i[0].mod, b.i[0].pmod, b.i[0].l, i, g,
					b.userdata, o, f, m);
			k.name = s7sdk.SwatchesParser.combinedImageName(e, false);
			if (p && p.length > 0) {
				if (k.name.indexOf("?")) {
					var c = k.name.substring(0, k.name.indexOf("?"));
					c += "?";
					c += p + "&";
					k.name = c + k.name.substring(k.name.indexOf("?"))
				}
			}
			k.mod += "?";
			k.images = h;
			return k
		} else {
			if (p && p.length > 0) {
				b.i.n += (b.i.n.indexOf("?") == -1) ? "?" : "&";
				b.i.n += p
			}
			return new s7sdk.ImageDesc(l, s7sdk.ItemDescType.IMG, b.i.n, n,
					parseInt(b.dx), parseInt(b.dy), b.iv, b.i.isDefault,
					b.i.mod, b.i.pmod, b.i.l, i, g, b.userdata, o, f, m)
		}
	};
	s7sdk.MediaSetParser.parseItemVideo = function(f, c, h, g) {
		var e = s7sdk.MediaSetParser.parseSwatch(c, c.iv, g);
		var a = null;
		var b = c.v.name;
		var d = s7sdk.VideoDescType.FILE;
		if (c.v.path != undefined) {
			b = c.v.path;
			d = s7sdk.VideoDescType.PATH
		}
		if (c.v.id != undefined) {
			b = c.v.id;
			d = s7sdk.VideoDescType.CATALOG_ID
		}
		if (c.i != undefined) {
			a = s7sdk.MediaSetParser.parseItemImage(null, c)
		}
		s7sdk.Logger.log(s7sdk.Logger.FINER, "posterImage: "
				+ (a != null ? a : "none"));
		return new s7sdk.VideoDesc(f, s7sdk.ItemDescType.VIDEO, b, d, e,
				c.v.suffix, c.iv, parseInt(c.v.dx), parseInt(c.v.dy),
				c.userdata, a, parseInt(c.v.bitrate))
	};
	s7sdk.MediaSetParser.resolveVideoAsset = function(c, b, a) {
		var d = c.name;
		if (((s7sdk.browser.name == "safari") && ((("ipad" == s7sdk.browser.device.name) || ("iphone" == s7sdk.browser.device.name)) || ((s7sdk.browser.device.name == "desktop")
				&& (!(s7sdk.browser.supportflash()) || (b.type == "native")) && s7sdk.browser.os == "mac")))
				|| ((s7sdk.browser.device.name == "blackberry")
						&& (s7sdk.browser.device.version == 10) && (!(s7sdk.browser
						.supportflash()) || (b.type == "native")))) {
			if (c.videoType != s7sdk.VideoDescType.PATH) {
				d += ".m3u8"
			}
		} else {
			if (((s7sdk.browser.device.name == "android") || ((s7sdk.browser.device.name == "desktop") && (!s7sdk.browser
					.supportflash() || (b.type == "native"))))
					&& (c.type == s7sdk.ItemDescType.VIDEO_SET)) {
				d = s7sdk.MediaSetParser.getAssetByNearestBitrate(c.items, a)
			}
		}
		return d
	};
	s7sdk.MediaSetParser.getAssetByNearestBitrate = function(h, g) {
		var f, b;
		var a = -1;
		var e = -1;
		var c = "";
		if (!h.length) {
			c = h.name
		} else {
			for (f = 0; f < h.length; f++) {
				b = parseInt(h[f].bitrate);
				if ((b <= g) && (b > e)) {
					a = b;
					e = b;
					c = h[f].name
				}
			}
			if (c == "") {
				var d = -1;
				for (f = 0; f < h.length; f++) {
					b = parseInt(h[f].bitrate);
					if ((d == -1) || (b < d)) {
						d = b;
						c = h[f].name
					}
				}
			}
		}
		return c
	};
	s7sdk.MediaSetParser.parseItemSet = function(c, a, e, d) {
		var b = s7sdk.MediaSetParser.parseSwatch(a, a.iv, d);
		return s7sdk.MediaSetParser.parseSet(c, a.set, e + 1, b, d)
	};
	s7sdk.MediaSetParser.parseSwatch = function(c, a, d) {
		if (c.s != undefined) {
			if (d && d.length > 0) {
				c.s.n += (c.s.n.indexOf("?") == -1) ? "?" : "&";
				c.s.n += d
			}
			var b = c.s.n;
			return new s7sdk.SwatchDesc(b, c.s.c, c.s.l, a, c.s.mod, c.s.pmod)
		}
		return null
	};
	s7sdk.MediaSetParser.parseTargets = function(e) {
		if (e.targets != undefined && e.targets.target != undefined) {
			var b = new Array();
			if (e.targets.target instanceof Array) {
				for ( var d = 0; d < e.targets.target.length; d++) {
					var c = e.targets.target[d];
					var g = (c.frame != undefined && c.frame != "" ? c.frame
							: -1);
					var a = c.rect.split(",");
					var f = new s7sdk.Rectangle(parseInt(a[0]), parseInt(a[1]),
							parseInt(a[2]), parseInt(a[3]));
					b.push(new s7sdk.TargetDesc(c.number, g, f, c.label,
							c.userData))
				}
			} else {
				var c = e.targets.target;
				var g = (c.frame != undefined && c.frame != "" ? c.frame : -1);
				var a = c.rect.split(",");
				var f = new s7sdk.Rectangle(parseInt(a[0]), parseInt(a[1]),
						parseInt(a[2]), parseInt(a[3]));
				b
						.push(new s7sdk.TargetDesc(c.number, g, f, c.label,
								c.userData))
			}
			return b
		}
		return null
	};
	s7sdk.MediaSetParser.parseMaps = function(b) {
		var d = null;
		function c(g) {
			var f = g.coords.split(",");
			for ( var e = 0; e < f.length; e++) {
				f[e] = parseFloat(f[e])
			}
			return new s7sdk.MapDesc(g.shape, f, g.alt, g.href, g.rollover_key,
					g.target)
		}
		if (b.map && b.map.area) {
			d = [];
			if (s7sdk.Util.isArray(b.map.area)) {
				for ( var a = 0; a < b.map.area.length; a++) {
					d.push(c(b.map.area[a]))
				}
			} else {
				if (b.map.area.coords && b.map.area.shape) {
					d.push(c(b.map.area))
				}
			}
		}
		return d
	};
	s7sdk.MediaSetParser.findCompanyNameInAsset = function(b) {
		var c = s7sdk.MediaSetParser.findFirstAssetInAsset(b);
		var a = c.indexOf("/");
		if (a > -1) {
			c = c.substring(0, a)
		}
		return c
	};
	s7sdk.MediaSetParser.findFirstAssetInAsset = function(c) {
		var d = c;
		var b = d.lastIndexOf("}");
		var a = d.indexOf("?");
		if ((a != -1) && (b < a)) {
			d = d.substring(0, a)
		}
		a = d.indexOf(":");
		if (a != -1) {
			d = d.substring(0, a)
		}
		a = d.indexOf(";");
		if (a != -1) {
			d = d.substring(0, a)
		}
		a = d.indexOf(",");
		if (a != -1) {
			d = d.substring(0, a)
		}
		d = d.replace("{", "");
		d = d.replace("{", "");
		d = d.replace("}", "");
		d = d.replace("(", "");
		d = d.replace("(", "");
		d = d.replace(")", "");
		return d
	};
	s7sdk.MediaSetParser.parseAssetForSetReq = function(f) {
		var h = f;
		var a = f;
		var d = false;
		var e = "";
		var b = "";
		var c = "";
		var i = h.lastIndexOf("}");
		var g = h.indexOf("?");
		if ((g != -1) && (i < g)) {
			c = h.substring(g + 1);
			h = h.substring(0, g);
			a = h
		}
		g = h.indexOf(":");
		if (g != -1) {
			h = h.substring(0, g);
			d = true
		}
		g = h.indexOf(";");
		if (g != -1) {
			h = h.substring(0, g);
			d = true
		}
		g = h.indexOf(",");
		if (g != -1) {
			h = h.substring(0, g);
			d = true
		}
		g = h.indexOf("/");
		if (g == -1) {
			h = h
		} else {
			h = h.substring(0, g)
		}
		h = h.replace("{", "");
		h = h.replace("{", "");
		h = h.replace("}", "");
		h = h.replace("(", "");
		h = h.replace("(", "");
		h = h.replace(")", "");
		if (c != "") {
			c = c + "&"
		}
		if (d == true) {
			e = c + "req=set,json,UTF-8&imageSet=" + a;
			b = h
		} else {
			e = c + "req=set,json,UTF-8";
			b = a
		}
		return {
			req : e,
			name : b,
			mod : c
		}
	}
};