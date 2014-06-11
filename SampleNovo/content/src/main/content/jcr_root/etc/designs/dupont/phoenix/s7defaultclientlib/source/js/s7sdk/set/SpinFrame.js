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
s7sdk.Util.require("s7sdk.set.SpinView");
s7sdk.Util.require("s7sdk.set.SpinFrameLoader");
if (!s7sdk.SpinFrame) {
	s7sdk.SpinFrame = function(c, b, f, a, e, d, g) {
		this.container = c;
		this.idx = a;
		this.imageName = f;
		this.serverUrl = b;
		this.viewProps = e;
		this.initWidth = d;
		this.initHeight = g;
		this.view = null;
		this.viewPort = null;
		this.notify = true;
		this.dragToPan = true;
		this.invalidated = false;
		this.tileRender = false;
		this.delayTileLoad = true;
		this.priority = 0;
		this.loaded = false;
		this.isReq = null;
		this.image = new Image();
		this.image.imageFrame = this
	};
	s7sdk.SpinFrame.MAX_PRIORITY = 100;
	s7sdk.SpinFrame.prototype.loadFrame = function() {
		if (this.view != null) {
			return
		}
		if (!this.loaded) {
			this.viewProps.width = this.initWidth;
			this.viewProps.height = this.initHeight;
			this.initView();
			s7sdk.Event.dispatch(this.image, s7sdk.Event.VIEW_LOADED, true);
			s7sdk.Event.addDOMListener(this.image, s7sdk.Event.RENDER,
					this.renderHandler, true);
			this.loaded = true
		}
	};
	s7sdk.SpinFrame.prototype.initView = function() {
		with (this) {
			s7sdk.Logger.log(s7sdk.Logger.FINER,
					"s7sdk.SpinFrame.initView - imageName: %0", imageName);
			this.view = new s7sdk.View(serverUrl + "/" + imageName,
					viewProps.width, viewProps.height, viewProps.resetWidth,
					viewProps.resetHeight, this.container.devicePixelRatio,
					viewProps.zoomStep, viewProps.limit,
					viewProps.transitionTime, 0, viewPort,
					viewProps.elasticZoom, viewProps.clickToZoom,
					viewProps.fmt, 0, false);
			view.dragToPan = dragToPan;
			view.tileRender = tileRender;
			view.delayTileLoad = delayTileLoad;
			view.viewParent = this.container;
			this.container.viewStateChange(this.view.state);
			if (viewProps.resetHeight != viewProps.outHeight
					|| viewProps.resetWidth != viewProps.outWidth) {
				view.resize(viewProps.outWidth, viewProps.outHeight)
			}
			if (invalidated) {
				view.loadImage();
				view.invalidate();
				invalidated = false
			}
		}
	};
	s7sdk.SpinFrame.prototype.resize = function() {
		if (this.view != null) {
			this.view.resize(this.viewProps.outWidth, this.viewProps.outHeight)
		}
	};
	s7sdk.SpinFrame.prototype.renderHandler = function(a) {
		if (this.imageFrame.view != null) {
			this.imageFrame.view.draw()
		}
	};
	s7sdk.SpinFrame.prototype.invalidate = function() {
		if (this.view != null) {
			this.view.tileRender = this.tileRender;
			this.view.loadImage();
			this.view.invalidate()
		} else {
			this.invalidated = true
		}
	};
	s7sdk.SpinFrame.prototype.setDragToPan = function(a) {
		this.dragToPan = a;
		if (this.view != null) {
			this.view.dragToPan = a
		}
	};
	s7sdk.SpinFrame.prototype.setDelayTileLoad = function(a) {
		if (this.view != null) {
			this.view.delayTileLoad = a
		}
		this.delayTileLoad = a
	};
	s7sdk.SpinFrame.prototype.unload = function(a) {
		if (this.view != null) {
			this.view.unload(a)
		}
	};
	s7sdk.SpinFrame.prototype.setTileRender = function(a) {
		if (this.view != null) {
			this.view.tileRender = a
		}
		this.tileRender = a
	};
	s7sdk.SpinFrame.prototype.setPriority = function(a) {
		this.priority = (a < 1) ? 1
				: (a > s7sdk.SpinFrame.MAX_PRIORITY) ? s7sdk.SpinFrame.MAX_PRIORITY
						: a
	};
	s7sdk.SpinFrame.prototype.getView = function() {
		return this.view
	}
};