;(function(context) {

	// util
	var _ = {

		bind: function(func, context) {
			return function() {
				return func.apply(context, arguments);
			};
		},

		each: function(array, func, context) {
			for (var i = 0, length = array.length; i < length; i++) {
				func.call(context || this, array[i]);
			}
		},

		reduce: function(array, func, result, context) {
			for (var i = 0, length = array.length; i < length; i++) {
				result = func.call(context || this, result, array[i]);
			}
			return result;
		},

		isArray: function(value) {
			return value && typeof value === 'object' && typeof value.length === 'number' && toString.call(value) === '[object Array]' || false;
		},

		isNumber: function(value) {
			return typeof value === 'number';
		},

		isFunction: function(value) {
			return typeof value === 'function';
		}

	};

	// constants
	var css3Properties = ['transitionProperty', 'transitionDuration', 'transitionDelay', 'transitionTimingFunction', 'transform', 'transformOrigin'],
		css3PropertyNames = _.reduce(css3Properties, function(result, item) {result[item] = item; return result;}, {}),
		venderPrefix = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
						(/firefox/i).test(navigator.userAgent) ? 'Moz' :
						(/trident/i).test(navigator.userAgent) ? 'ms' :
						'opera' in window ? 'O' : '';

	var unit = function(value, unit) {
		return _.isNumber(value) ? value + unit : value;
	};

	var pixel = function(value) {
		return unit(value, 'px');
	};

	var venderProperty = function(propertyName) {
		if (css3PropertyNames[propertyName]) {
			return venderPrefix + propertyName.charAt(0).toUpperCase() + propertyName.substring(1);
		} else {
			return propertyName;
		}
	};

	var Animate = function(elements) {
		this.elements = _.isArray(elements) ? elements : [elements];
		this.queue = [];
		this.animated = false;
	};
	Animate.prototype = {
		transit: function(duration, styles, callback) {
			this.queue.push(_.bind(function() {
				duration = duration || 0;

				_.each(this.elements, function(element) {
					var style = element.style,
						totalDuration = duration;

					style[venderProperty('transitionDuration')] = duration + 'ms';
					totalDuration += this.convertStyles(styles);

					for (var name in styles) {
						style[name] = styles[name];
					}

					setTimeout(_.bind(function() {
						if (callback) callback.call(element);
						this.nextQueue();
					}, this), totalDuration);
				}, this);
			}, this));

			if (!this.animated) {
				this.nextQueue();
			}

			return this;
		},

		convertStyles: function(styles) {
			var duration = 0,
				transformValues = [];

			if (styles['ease']) {
				styles[venderProperty('transitionTimingFunction')] = styles['ease'];
				delete styles['ease'];
			}
			if (styles['delay']) {
				styles[venderProperty('transitionDelay')] = styles['delay'] + 'ms';
				duration = Number(styles['delay']);
				delete styles['delay'];
			}

			if (styles['translate']) {
				var x = styles['translate'].x || '0px',
					y = styles['translate'].y || '0px';

				transformValues.push('translate(' + pixel(x) + ', ' + pixel(y) + ')');
			} else {
				transformValues.push('translate(0px, 0px)');
			}
			if (styles['scale']) {
				var x = styles['scale'].x || '0px',
					y = styles['scale'].y || '0px';

				transformValues.push('scale(' + x + ', ' + y + ')');
			} else {
				transformValues.push('scale(1, 1)');
			}
			if (styles['rotate']) {
				transformValues.push('rotate(' + unit(styles['rotate'], 'deg') + ')');
			} else {
				transformValues.push('rotate(0deg)');
			}
			if (styles['skew']) {
				var x = styles['skew'].x || '0px',
					y = styles['skew'].y || '0px';

				transformValues.push('skewX(' + unit(x, 'deg') + ') skewY(' + unit(y, 'deg') + ')');
			} else {
				transformValues.push('skewX(0deg) skewY(0deg)');
			}
			styles[venderProperty('transform')] = transformValues.join(' ');

			return duration;
		},

		nextQueue: function() {
			if (this.queue.length > 0) {
				this.animated = true;
				this.queue.shift().call(this);
			}
		}
	};

	context.anim = function(elements) {
		return new Animate(elements);
	};

})(window);
