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
if (!s7sdk.InputController) {
	s7sdk.InputController = function InputController(o, n) {
		function s(u) {
			if (!u) {
				u = window.event
			}
			var t = null;
			if (u.target) {
				t = (u.target.nodeType == 3) ? u.target.parentNode : u.target
			} else {
				t = u.srcElement
			}
			u.targetNode = t;
			if (!u.touches) {
				u.touches = [ {
					pageX : u.pageX
							|| u.clientX
							+ (document && document.scrollLeft || document.body
									&& document.body.scrollLeft || 0)
							- (document && document.clientLeft || document.body
									&& document.body.clientLeft || 0),
					pageY : u.pageY
							|| u.clientY
							+ (document && document.scrollTop || document.body
									&& document.body.scrollTop || 0)
							- (document && document.clientTop || document.body
									&& document.body.clientTop || 0)
				} ]
			}
			if (!u.preventDefault) {
				u.preventDefault = function() {
					u.returnValue = false
				}
			}
			if (!u.stopPropagation) {
				u.stopPropagation = function() {
					u.cancelBubble = true
				}
			}
			return u
		}
		var e = 0;
		var r = 64;
		var d = 30;
		var k = 50;
		var f = 300;
		var j = 0;
		var m = null;
		var c = 0;
		var q = 0;
		var h = false;
		var p = false;
		var i = {};
		var b = null;
		var g = 250;
		var a = {};
		this.params = n || new Object();
		this.singleTapCallback = this.params.singleTapCallback || null;
		this.doubleTapCallback = this.params.doubleTapCallback || null;
		this.swipeCallback = this.params.swipeCallback || null;
		this.startTouchCallback = this.params.startTouchCallback || null;
		this.dragCallback = this.params.dragCallback || null;
		this.endDragCallback = this.params.endDragCallback || null;
		this.pinchCallback = this.params.pinchCallback || null;
		this.endPinchCallback = this.params.endPinchCallback || null;
		this.endTouchCallback = this.params.endTouchCallback || null;
		this.elem = o || null;
		var l = this;
		this.touchStart = function(t) {
			s(t);
			t.preventDefault();
			e = t.touches.length;
			l.start(l.elem);
			if (e == 1) {
				c = new Date().getTime();
				dragStartX = i.startX = i.curX = t.touches[0].pageX;
				dragStartY = i.startY = i.curY = t.touches[0].pageY;
				i.last = i.start = c;
				if (l.startTouchCallback) {
					l.startTouchCallback(t, i.startX, i.startY)
				}
			} else {
				l.touchCancel(t);
				a.scale = null;
				a.X = null;
				a.Y = null;
				a.start = new Date().getTime();
				a.initialSize = Math.sqrt(Math.pow(t.touches[0].pageX
						- t.touches[1].pageX, 2)
						+ Math.pow(t.touches[0].pageY - t.touches[1].pageY, 2))
			}
		};
		this.touchMove = function(x) {
			s(x);
			x.preventDefault();
			i.move = new Date().getTime();
			h = true;
			if (x.touches.length == 1) {
				i.curX = x.touches[0].pageX;
				i.curY = x.touches[0].pageY;
				if ((l.dragCallback) && i.last) {
					var v = i.curX - dragStartX;
					var u = i.curY - dragStartY;
					if (v != 0 || u != 0) {
						l.dragCallback(x, i.curX, i.curY, v, u)
					}
				}
				dragStartX = x.touches[0].pageX;
				dragStartY = x.touches[0].pageY
			} else {
				if (x.touches.length > 1) {
					l.touchCancel(x);
					if ((x.timeStamp - a.start) < d) {
						return false
					}
					a.X = (x.touches[0].pageX + x.touches[1].pageX) / 2;
					a.Y = (x.touches[0].pageY + x.touches[1].pageY) / 2;
					a.changeSize = Math.sqrt(Math.pow(x.touches[0].pageX
							- x.touches[1].pageX, 2)
							+ Math.pow(x.touches[0].pageY - x.touches[1].pageY,
									2));
					a.pinchScale = a.changeSize / a.initialSize;
					if (a.pinchScale > 1) {
						var y = Math.pow(2, (a.pinchScale - 1) / 2);
						a.pinchScale = 1 / y
					} else {
						var w = 1 / (a.pinchScale);
						var t = Math.pow(2, (w - 1) / 2);
						a.pinchScale = t
					}
					if ((l.pinchCallback) && (a.pinchScale != 1)) {
						l.pinchCallback(x, a.X, a.Y, a.pinchScale)
					}
					a.initialSize = a.changeSize
				}
			}
		};
		this.touchEnd = function(A) {
			s(A);
			A.preventDefault();
			i.end = new Date().getTime();
			h = false;
			i.isDoubleTap = false;
			if (e == 1) {
				if (l.endTouchCallback) {
					l.endTouchCallback(A, i.curX, i.curY)
				}
				j = Math.round(Math.sqrt(Math.pow(i.curX - i.startX, 2)
						+ Math.pow(i.curY - i.startY, 2)));
				if ((j >= r) && (i.curX != 0)
						&& (((i.end - i.start) > k) && ((i.end - i.start) < f))) {
					var y = i.curX - i.startX;
					var x = i.curY - i.startY;
					if ((Math.abs(y) >= r) && (Math.abs(y) > Math.abs(x))) {
						if (y < 0) {
							m = "left"
						} else {
							m = "right"
						}
					} else {
						if (Math.abs(x) >= r) {
							if (x < 0) {
								m = "down"
							} else {
								m = "up"
							}
						}
					}
					if (l.swipeCallback) {
						l.swipeCallback(m)
					}
					p = true;
					l.touchCancel(A)
				} else {
					if ((j > 0) && (i.curX != 0)) {
						p = false;
						var w = false;
						if (l.endDragCallback) {
							var v = i.curX - i.startX;
							var t = i.curY - i.startY;
							l.endDragCallback(A, i.curX, i.curY, v, t)
						}
						l.touchCancel(A)
					} else {
						p = false;
						var w = false;
						if (b) {
							clearTimeout(b);
							b = null;
							if (l.doubleTapCallback) {
								l.doubleTapCallback(A, i.curX, i.curY)
							}
							i = {};
							w = true
						} else {
							if (("last" in i) && (j < r) && !h) {
								w = true;
								var u = {};
								for ( var z in A) {
									u[z] = A[z]
								}
								b = setTimeout(function() {
									if (l.singleTapCallback) {
										l.singleTapCallback(u, i.curX, i.curY)
									}
									if (b) {
										clearTimeout(b);
										b = null
									}
									i = {}
								}, g)
							}
						}
						if (!w) {
							l.touchCancel(A)
						}
					}
				}
			} else {
				l.touchCancel(A);
				if (l.endPinchCallback) {
					l.endPinchCallback(A, a.X, a.Y, a.pinchScale)
				}
			}
			l.stop(l.elem)
		};
		this.touchCancel = function(t) {
			if (b) {
				clearTimeout(b)
			}
			b = null;
			e = 0;
			j = 0;
			m = null;
			i = {};
			h = false
		};
		if (this.elem) {
			this.attach(this.elem)
		}
		return this
	};
	s7sdk.InputController.prototype.attach = function(a) {
		this.elem = a;
		if (this.elem) {
			if ("ontouchstart" in window) {
				s7sdk.Event.addDOMListener(this.elem, "touchstart",
						this.touchStart, false)
			} else {
				s7sdk.Event.addDOMListener(this.elem, "mousedown",
						this.touchStart, false);
				s7sdk.Event.addDOMListener(this.elem, "dblclick",
						this.touchEnd, false)
			}
		}
	};
	s7sdk.InputController.prototype.detach = function(a) {
		this.elem = a;
		if (this.elem) {
			if ("ontouchstart" in window) {
				s7sdk.Event.removeDOMListener(this.elem, "touchstart",
						this.touchStart, false)
			} else {
				s7sdk.Event.removeDOMListener(this.elem, "mousedown",
						this.touchStart, false);
				s7sdk.Event.removeDOMListener(this.elem, "dblclick",
						this.touchEnd, false)
			}
		}
	};
	s7sdk.InputController.prototype.start = function(a) {
		this.elem = a;
		if (this.elem) {
			if ("ontouchstart" in window) {
				s7sdk.Event.addDOMListener(document.body, "touchmove",
						this.touchMove, false);
				s7sdk.Event.addDOMListener(document.body, "touchend",
						this.touchEnd, false);
				s7sdk.Event.addDOMListener(document.body, "touchcancel",
						this.touchCancel, false)
			} else {
				s7sdk.Event.addDOMListener(document.body, "mousemove",
						this.touchMove, false);
				s7sdk.Event.addDOMListener(document.body, "mouseup",
						this.touchEnd, false)
			}
		}
	};
	s7sdk.InputController.prototype.stop = function(a) {
		this.elem = a;
		if (this.elem) {
			if ("ontouchstart" in window) {
				s7sdk.Event.removeDOMListener(document.body, "touchmove",
						this.touchMove, false);
				s7sdk.Event.removeDOMListener(document.body, "touchend",
						this.touchEnd, false);
				s7sdk.Event.removeDOMListener(document.body, "touchcancel",
						this.touchCancel, false)
			} else {
				s7sdk.Event.removeDOMListener(document.body, "mousemove",
						this.touchMove, false);
				s7sdk.Event.removeDOMListener(document.body, "mouseup",
						this.touchEnd, false)
			}
		}
	}
};