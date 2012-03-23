if (!window.$sa) {
	window.$sa = {};
}
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

		self.load = function() { // *options
			var _opt = $.extend({
					url: '',
					index: null,
					cache: opt.cache
				}, arguments[0]),

				index = _opt.index;

			if (!index) {
				index = _opt['index'] = _opt.url.replace(/\.svgz?$/, '');
			}

			var asset = assets[index] = new $sa.SVGAsset(_opt);

			return asset.load();
		};

		self.getAsset = function(index) {
			if (!index in assets) {

				throw new Error("Could not find asset: "+index);
			}

			return assets[index];
		};

		self.getSprite = function(asset, id) {
			if (!id && asset.indexOf('#')) {
				var parts = asset.split('#');

				asset = parts[0];
				id = parts[1];
			}

			return self.getAsset(asset).getSprite(id);
		};

		self.init();
	};

	_static = {
		name: _name,
		instance: function(options) {
			if (!_instance) {
				_instance = new SVGLoader(options);
			}

			return _instance;
		}
	};

	return _static;
})(jQuery);
$sa.SVGAsset = (function($, undefined) {
	var _ns = 'sa',
		_name = 'svgasset';

	SVGAsset = function(options) {
		var self = this,

			opt = {
				url: '',
				index: '',
				cache: true,
				className: null
			},
			core = {
				data: null,
				ids: []
			},
			cache = {
				$data: null,
				$svg: null,
				sprites: {}
			};

		self.xhr = {
			load: null
		};

		self.init = function() {
			$.extend(true, opt, options);
		};

		self.load = function() {
			if (self.xhr.load) { return self.xhr.load; }

			core.ids = [];

			var xhr = self.xhr.load = $.ajax({
				url: opt.url,
				cache: opt.cache,
				dataType: 'text'
			})
			.done(function(data) {
				core.data = $.parseXML(data);
				cache.$data = $(core.data);
				core.ids = [];

				cache.$data.find('[id]').each(function(index, item) {
					core.ids.push(item.id);
				});
			})
			.fail(function(data) {

				throw new Error("Could not load svg file: "+url);
			});

			return xhr;
		};

		self.get = function(id, cls) {
			if (id && id[0] === '#') { id = id.slice(1); }

			var className = [id, opt.className, cls].join(' '),
				$sprite = cache.sprites[id],
				$svg, $item, $body;

			// sprite is cached
			if ($sprite) {

				return $sprite.clone();
			}

			// find element
			$item = cache.$data.find('#'+id);
			if (!$item[0]) {

				throw new Error("Could not find element #"+id);
			}

			// is svg element
			if ($item.is('svg')) {
				$sprite = $item.clone();
			}
			else {
				$svg = $item.closest('svg');
				$sprite = $svg.clone().empty();
				$body = $item.clone();

				$body
					.removeAttr('id')
					.attr('display', 'inherit');
			}

			$sprite
				.removeAttr('id')
				.attr('class', className);

			if ($body) {
				$sprite.append($body);
			}

			// store to cache
			cache.sprites[id] = $sprite.clone();

			return $sprite;
		};

		self.init();
	};

	return SVGAsset;
})(jQuery);
