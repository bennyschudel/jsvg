$sa.SVGLoader = (function($, undefined) {
	var _ns = 'sa',
		_name = 'svgloader',

		_instance,

	SVGLoader = function(options) {
		var self = this,

			opt = {
				cache: true
			},
			core = {},
			assets = {};

		self.init = function() {
			$.extend(true, opt, options);
		};

		self.load = function(arg0) {
			var _opt = $.extend({
					url: '',
					name: null,
					cache: opt.cache
				}, arg0),

				name = _opt.name;

			if (!name) {
				name = _opt['name'] = _opt.url.replace(/\.svgz?$/, '');
			}

			var asset = assets[name] = new $sa.SVGAsset(_opt);

			return asset.load();
		};

		self.getAsset = function(name) {
			if (name instanceof $sa.SVGAsset) { return name; }

			if (!(name in assets)) {
				throw new Error("Could not find asset: "+name);
			}

			return assets[name];
		};

		self.getSprite = function(asset, id, cls) {
			return self.getAsset(asset).get(id, cls);
		};

		self.init();
	};

	if (!_instance) {
		_instance = new SVGLoader();
	}
	return _instance;

})(jQuery);
