if (!('$sa' in window)) {
	window.$sa = {};
}
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
				cache        : true,
				appendToBody : true
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
					appendToBody : options.appendToBody
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

		this.getSprite = function(asset, id, cls) {
			return this.getAsset(asset).get(id, cls);
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
(function($sa, $) {

	var
		RE_TRIM = /^[\s]*|[\s]*$/g,

		_trim = function(str) {
			return str.replace(RE_TRIM, '');
		};

	$sa.SVGAsset = function(options_) {
		var
			_this = this,

			options = {
				url          : '',
				index        : '',
				cache        : true,
				className    : null,
				appendToBody : true
			},
			core = {
				data      : null,
				ids       : []
			},
			cache = {
				$svg      : null,
				sprites   : {}
			};

		this.VERSION = '0.5.7';

		this.init = function() {
			$.extend(true, options, options_);

			this.xhr = { load: null };
		};

		this.load = function() {
			if (this.xhr.load) { return this.xhr.load; }

			core.ids = [];

			var
				xhr = this.xhr.load = $.ajax({
					url      : options.url,
					cache    : options.cache,
					dataType : 'text',
					context  : {
						asset : _this
					}
				})
				.done(function(data_) {
					var data = core.data  = $.parseXML(data_),
						$svg = cache.$svg = $(data).find('> svg'),
						ids  = core.ids   = [];

					$svg.find('[id]').each(function(index, item) {
						ids.push(item.id);
					});

					if (options.appendToBody) {
						$('body').append($svg);
					}
				})
				.fail(function(data) {
					throw new Error("Could not load svg file: "+options.url);
				});

			return xhr;
		};

		this.get = function(id, cls) {
			if (id && id[0] === '#') { id = id.slice(1); }

			var
				className = _trim([id, options.className, cls].join(' ')),
				$sprite = cache.sprites[id],
				$svg, $item, $body;

			// sprite is cached
			if ($sprite) {
				return $sprite.clone();
			}

			// find element
			$item = cache.$svg.find('#'+id);
			if (!$item[0]) {
				throw new Error("Could not find svg element #"+id);
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

		this.getIds = function() {
			return core.ids;
		};

		this.getOption = function(key) {
			return options[key];
		};

		this.init();
	};

})(window.$sa, window.jQuery);
