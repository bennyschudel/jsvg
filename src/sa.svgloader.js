$sa.SVGLoader = (function($, undefined) {
	var _name = 'svgloader',
		_instance,

	SVGLoader = function(options_) {
		var
			_this = this,

			options = {
				cache: true
			},
			core = {},
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

		this.init();
	};

	if (!_instance) {
		_instance = new SVGLoader();
	}
	return _instance;

})(jQuery);
