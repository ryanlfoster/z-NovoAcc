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
if (!s7sdk.Point2D) {
	s7sdk.Point2D = function Point2D(e, f) {
		this.x = e == null ? 0 : e;
		this.y = f == null ? 0 : f
	};
	s7sdk.Point2D.prototype.clone = function() {
		return new s7sdk.Point2D(this.x, this.y)
	};
	s7sdk.Point2D.prototype.getLength = function() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
	};
	s7sdk.Point2D.prototype.add = function(e) {
		return new s7sdk.Point2D(this.x + e.x, this.y + e.y)
	};
	s7sdk.Point2D.prototype.subtract = function(e) {
		return new s7sdk.Point2D(this.x - e.x, this.y - e.y)
	};
	s7sdk.Point2D.prototype.negate = function() {
		return new s7sdk.Point2D(-this.x, -this.y)
	};
	s7sdk.Point2D.prototype.scale = function(e) {
		return new s7sdk.Point2D(this.x * e, this.y * e)
	};
	s7sdk.Point2D.prototype.toString = function() {
		return "" + this.x + ", " + this.y
	};
	s7sdk.Point2D.prototype.equals = function(e) {
		return this.x == e.x && this.y == e.y
	}
}
if (!s7sdk.Rectangle) {
	s7sdk.Rectangle = function(f, h, g, e) {
		this.x = !f || typeof (f) == "undefined" ? 0 : f;
		this.y = !h || typeof (h) == "undefined" ? 0 : h;
		this.width = !g || typeof (g) == "undefined" ? 0 : g;
		this.height = !e || typeof (e) == "undefined" ? 0 : e
	};
	s7sdk.Rectangle.prototype.containsRect = function(e) {
		if (e.x < this.x) {
			return false
		}
		if (e.y < this.y) {
			return false
		}
		if (e.width + e.x > this.width + this.x) {
			return false
		}
		if (e.height + e.y > this.height + this.y) {
			return false
		}
		return true
	};
	s7sdk.Rectangle.prototype.containsPoint = function(e, f) {
		if (e < this.x) {
			return false
		}
		if (f < this.y) {
			return false
		}
		if (e > this.width + this.x) {
			return false
		}
		if (f > this.height + this.y) {
			return false
		}
		return true
	};
	s7sdk.Rectangle.prototype.isEmpty = function() {
		with (this) {
			if (width > 0 && height > 0) {
				return false
			}
			return true
		}
	};
	s7sdk.Rectangle.prototype.equals = function(e) {
		if (e.x != this.x) {
			return false
		}
		if (e.y != this.y) {
			return false
		}
		if (e.width != this.width) {
			return false
		}
		if (e.height != this.height) {
			return false
		}
		return true
	};
	s7sdk.Rectangle.prototype.intersection = function(h) {
		var g = new s7sdk.Rectangle(0, 0, 0, 0);
		g.x = Math.max(this.x, h.x);
		g.y = Math.max(this.y, h.y);
		var f = Math.min(this.x + this.width, h.x + h.width);
		var e = Math.min(this.y + this.height, h.y + h.height);
		g.width = f > g.x ? f - g.x : 0;
		g.height = e > g.y ? e - g.y : 0;
		return g
	};
	s7sdk.Rectangle.prototype.topLeft = function() {
		return new s7sdk.Point2D(this.x, this.y)
	};
	s7sdk.Rectangle.prototype.bottomRight = function() {
		return new s7sdk.Point2D(this.x + this.width, this.y + this.height)
	};
	s7sdk.Rectangle.prototype.toString = function() {
		with (this) {
			return "s7sdk.Rectangle " + x + ", " + y + ", " + width + ", "
					+ height
		}
	};
	s7sdk.Rectangle.prototype.getLeft = function() {
		return this.x
	};
	s7sdk.Rectangle.prototype.getRight = function() {
		return this.x + this.width
	};
	s7sdk.Rectangle.prototype.getTop = function() {
		return this.y
	};
	s7sdk.Rectangle.prototype.getBottom = function() {
		return this.y + this.height
	}
}
if (!s7sdk.Matrix2D) {
	s7sdk.Matrix2D = function(h, f, j, i, g, e) {
		this.a = h == null ? 1 : h;
		this.b = f == null ? 0 : f;
		this.c = j == null ? 0 : j;
		this.d = i == null ? 1 : i;
		this.tx = g == null ? 0 : g;
		this.ty = e == null ? 0 : e
	};
	s7sdk.Matrix2D.prototype.clone = function() {
		return new s7sdk.Matrix2D(this.a, this.b, this.c, this.d, this.tx,
				this.ty)
	};
	s7sdk.Matrix2D.prototype.translate = function(f, e) {
		this.tx += f;
		this.ty += e
	};
	s7sdk.Matrix2D.prototype.scale = function(f, e) {
		this.a *= f;
		this.b *= e;
		this.c *= f;
		this.d *= e;
		this.tx *= f;
		this.ty *= e
	};
	s7sdk.Matrix2D.prototype.transformPoint = function(f) {
		var e = f.clone();
		e.x = this.a * f.x + this.c * f.y + this.tx;
		e.y = this.b * f.x + this.d * f.y + this.ty;
		return e
	};
	s7sdk.Matrix2D.prototype.transformRect = function(g) {
		var e = this.transformPoint(g.topLeft());
		var f = this.transformPoint(g.bottomRight());
		return new s7sdk.Rectangle(e.x, e.y, f.x - e.x, f.y - e.y)
	};
	s7sdk.Matrix2D.prototype.invert = function() {
		var f = this.a * this.d - this.b * this.c;
		if (f == 0) {
			throw new Error("Matrix is not inversible")
		}
		var e = this.clone();
		this.a = e.d / f;
		this.b = -e.b / f;
		this.c = -e.c / f;
		this.d = e.a / f;
		this.tx = (e.ty * e.c - e.tx * e.d) / f;
		this.ty = (e.tx * e.b - e.ty * e.a) / f
	};
	s7sdk.Matrix2D.prototype.concat = function(e) {
		var f = this.clone();
		this.a = e.a * f.a + e.c * f.b;
		this.b = e.b * f.a + e.d * f.b;
		this.c = e.a * f.c + e.c * f.d;
		this.d = e.b * f.c + e.d * f.d;
		this.ty = e.b * f.tx + e.d * f.ty + e.ty;
		this.tx = e.a * f.tx + e.c * f.ty + e.tx
	};
	s7sdk.Matrix2D.prototype.toString = function() {
		with (this) {
			return "Matrix2D(" + a + ", " + b + ", " + c + ", " + d + ", " + tx
					+ ", " + ty + ")"
		}
	}
}
if (!s7sdk.TileAddress) {
	s7sdk.TileAddress = function(f, j, e, i, g) {
		this.w = f;
		this.h = j;
		this.idx = e;
		this.pos_x = i;
		this.pos_y = g
	};
	s7sdk.TileAddress.prototype.x = function() {
		return this.pos_x
	};
	s7sdk.TileAddress.prototype.y = function() {
		return this.pos_y
	}
};