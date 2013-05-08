if (!window.$sa) {
	window.$sa = {};
}
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
$sa.SVGAsset = (function($, undefined) {
	var _name = 'svgasset',

	SVGAsset = function(options_) {
		var
			_this = this,

			options = {
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

		this.init = function() {
			$.extend(true, options, options_);

			this.xhr = { load: null };
		};

		this.load = function() {
			if (this.xhr.load) { return this.xhr.load; }

			core.ids = [];

			var
				xhr = this.xhr.load = $.ajax({
					url: options.url,
					cache: options.cache,
					dataType: 'text',
					context: {
						asset: _this
					}
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

					throw new Error("Could not load svg file: "+options.url);
				});

			return xhr;
		};

		this.get = function(id, cls) {
			if (id && id[0] === '#') { id = id.slice(1); }

			var
				className = [id, options.className, cls].join(' '),
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

		this.init();
	};

	return SVGAsset;
})(jQuery);
