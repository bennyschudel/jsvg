(function($sa, $) {
	var _instance;

	$sa.SVGLoader = function(options_) {

		if (_instance) {
			return _instance;
		}
		if (!(this instanceof $sa.SVGLoader)) {
			return _instance = new $sa.SVGLoader(options_);
		}

		var
			_this = this,

			options = {
				cache       : true,
				appendToDOM : true
			},
			assets = {};

		this.VERSION = '0.5.7';

		this.init = function() {
			$.extend(true, options, options_);
		};

		this.load = function(opt_) {
			var
				opt = $.extend({
					cache        : options.cache,
					appendToDOM : options.appendToDOM
				}, opt_),
				name = opt.name;

			if (!name) {
				name = opt['name'] = opt.url.match(/([^\/]*)\.svgz?$/)[1];
			}

			var asset = assets[name] = new $sa.SVGAsset(opt);

			return asset.load();
		};

		this.getAsset = function(name) {
			if (name instanceof $sa.SVGAsset) {
				return name;
			}

			if (!(name in assets)) {
				throw new Error("Could not find asset: "+name);
			}

			return assets[name];
		};

		this.getSprite = function(asset, id, opt) {
			return this.getAsset(asset).get(id, opt);
		};

		this.getAssets = function() {
			return assets;
		};

		this.getOption = function(key) {
			return options[key];
		};

		this.init();
	};

})(window.$sa, window.jQuery);
