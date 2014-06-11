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
s7sdk.Util.require("s7sdk.event.Event");
if (!s7sdk.Tile) {
	s7sdk.Tile = function(e, c, b, a, d) {
		if (a == null) {
			a = "jpg"
		}
		if (d == null) {
			d = 0
		}
		this.invalidated = true;
		this.loaded = false;
		this.loadSent = false;
		this.level = e;
		this.tileAddress = c;
		this.url = b;
		this.fmt = a;
		this.transparent = ((this.fmt.indexOf("png") != -1 || this.fmt
				.indexOf("gif") != -1) && (this.fmt.indexOf("-alpha") > 0)) ? true
				: false;
		this.image = null;
		this.loadTile(d)
	};
	s7sdk.Tile.loadedTileStack = [];
	s7sdk.Tile.maxHighResTileImages = -1;
	s7sdk.Tile.timeout = function(a) {
		a.load()
	};
	s7sdk.Tile.prototype.releaseImage = function(a) {
		a.image = this.image;
		this.image = null
	};
	s7sdk.Tile.prototype.loadTile = function(a) {
		if (a < 0) {
			return
		}
		s7sdk.Logger.log(s7sdk.Logger.FINEST, "Tile.loadTile %0, %1",
				this.tileAddress.pos_x, this.tileAddress.pos_y);
		if (a == 0) {
			this.load()
		} else {
			s7sdk.Util.timeout(s7sdk.Tile.timeout, a, [ this ])
		}
		this.loadSent = true
	};
	s7sdk.Tile.prototype.load = function() {
		var a = this.url + (this.url.indexOf("?") < 0 ? "?" : "&");
		a += "req=tile&rect=" + this.tileAddress.pos_x * 256 + ","
				+ this.tileAddress.pos_y * 256 + ",";
		a += this.tileAddress.w + "," + this.tileAddress.h;
		a += "&fmt=" + this.fmt;
		if (s7sdk.Tile.maxHighResTileImages > 0
				&& s7sdk.Tile.loadedTileStack.length > s7sdk.Tile.maxHighResTileImages) {
			var b = s7sdk.Tile.loadedTileStack.shift();
			this.image = b.image;
			b.image = null;
			b.loaded = false;
			b.loadSent = false
		} else {
			this.image = new Image()
		}
		if (s7sdk.Tile.maxHighResTileImages > 0 && this.level == 0) {
			s7sdk.Tile.loadedTileStack.push(this)
		}
		this.image.onload = this.onLoadImage;
		this.image.onerror = this.onErrorImage;
		this.image.onabort = this.onAbortImage;
		this.image.imageTile = this;
		this.image.src = a;
		s7sdk.Logger.log(s7sdk.Logger.FINER, "Tile.load %0", a)
	};
	s7sdk.Tile.prototype.onLoadImage = function(a) {
		this.imageTile.loaded = true;
		this.imageTile.invalidated = true;
		s7sdk.Event.dispatch(this, s7sdk.Event.TILE_LOADED, true)
	};
	s7sdk.Tile.prototype.onErrorImage = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.WARNING, "Tile failed to load");
		s7sdk.Event.dispatch(this, s7sdk.Event.TILE_FAILED, true)
	};
	s7sdk.Tile.prototype.onAbortImage = function(a) {
		s7sdk.Logger.log(s7sdk.Logger.WARNING, "Tile failed to load");
		s7sdk.Event.dispatch(this, s7sdk.Event.TILE_FAILED, true)
	};
	s7sdk.Tile.prototype.invalidate = function() {
		this.invalidated = true
	};
	s7sdk.Tile.prototype.addEventListener = function(c, b, a) {
		s7sdk.Base.prototype.addEventListener.apply(this, [ c, b, a ])
	};
	s7sdk.Tile.prototype.draw = function(a, g, k) {
		if (this.invalidated == false) {
			return
		}
		var i = new s7sdk.Matrix2D(1, 0, 0, 1, this.tileAddress.pos_x
				* s7sdk.Enum.TILE.SIZE, this.tileAddress.pos_y
				* s7sdk.Enum.TILE.SIZE);
		i.concat(a);
		var b = g.getContext("2d");
		if (this.loaded) {
			this.invalidated = false;
			if (this.transparent) {
				b.clearRect(i.tx, i.ty, this.tileAddress.w, this.tileAddress.h)
			}
			b.drawImage(this.image, 0, 0, this.tileAddress.w,
					this.tileAddress.h, i.tx, i.ty, this.tileAddress.w,
					this.tileAddress.h)
		} else {
			var c = 256;
			var f = 256;
			var e = 0;
			var d = 0;
			var h = k.lowerTile(this.level, this.tileAddress);
			if (h != null) {
				var l = h.image;
				var j = Math.pow(2, h.level - this.level);
				c = 256 / j;
				f = 256 / j;
				e = c * (this.tileAddress.x() % j);
				d = f * (this.tileAddress.y() % j);
				if (c + e > h.image.width) {
					c = h.image.width - e
				}
				if (f + d > h.image.height) {
					f = h.image.height - d
				}
				if (c > 0 && f > 0) {
					if (this.transparent) {
						b.clearRect(i.tx, i.ty, this.tileAddress.w,
								this.tileAddress.h)
					}
					b.drawImage(h.image, e, d, c, f, i.tx, i.ty,
							this.tileAddress.w, this.tileAddress.h);
					s7sdk.Logger
							.log(
									s7sdk.Logger.FINEST,
									"Tile.draw Rendering from lower tile: %0 %1 %2 %3 to %4 %5 %6 %7 ",
									e, d, c, f, i.tx, i.ty, this.tileAddress.w,
									this.tileAddress.h)
				} else {
					s7sdk.Logger
							.log(
									s7sdk.Logger.FINER,
									"Tile.draw empty source size: %0 %1 %2 %3 to %4 %5 %6 %7 ",
									e, d, c, f, i.tx, i.ty, this.tileAddress.w,
									this.tileAddress.h)
				}
			} else {
				s7sdk.Logger.log(s7sdk.Logger.FINER, "Tile.draw level "
						+ this.level + " empty tile idx "
						+ this.tileAddress.idx + " x " + this.tileAddress.pos_x
						+ " y " + this.tileAddress.pos_y)
			}
		}
	}
};