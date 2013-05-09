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
				cache: true
			},
			assets = {};

		this.init = function() {
			$.extend(true, options, options_);
		};

		this.load = function(opt_) {
			var
				opt = $.extend({
					url: '',
					name: null,
					cache: options.cache
				}, opt_),
				name = opt.name;

			if (!name) {
				name = opt['name'] = opt.url.replace(/\.svgz?$/, '');
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

		this.getSprite = function(asset, id, cls) {
			return this.getAsset(asset).get(id, cls);
		};

		this.getOption = function(key) {
			return options[key];
		};

		this.init();
	};

})(window.$sa, window.jQuery);
