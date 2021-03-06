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
				asset : {
					url              : '',
					name             : '',
					cache            : true,
					appendToDom      : true,
					copyIdsToClasses : true
				}
			},
			assets = {};

		this.VERSION = '0.6.2';

		this.init = function() {
			$.extend(true, options, options_);
		};

		this.load = function(opt_) {
			var
				opt = $.extend(options.asset, opt_),
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
(function($sa, $) {

	var
		RE_CLEAN = /[\s]{2,}/g,
		RE_TRIM = /^[\s]*|[\s]*$/g,

		_clean = function(str) {
			return str.replace(RE_CLEAN, ' ');
		},
		_trim = function(str) {
			return str.replace(RE_TRIM, '');
		},
		_makeId = function(len, charset) {
			if (!len)     { len     = 6; }
			if (!charset) { charset = "abcdefghijklmnopqrstuvwxyz"; }

			var
				str = '',
				i;

			for(i = 0; i < len; i++) {
				str += charset.charAt(Math.floor(Math.random() * charset.length));
			}

			return str;
		};

	$sa.SVGAsset = function(options_) {
		var
			_this = this,

			options = {
				url              : '',
				name             : '',
				cache            : true,
				unify            : true,
				appendToDom      : true,
				copyIdsToClasses : true
			},
			core = {
				data      : null,
				ids       : []
			},
			cache = {
				$svg      : null,
				sprites   : {}
			},

			unifyOptions = {
				prefix : '',
				suffix : ''
			},

			addClass, alterId, unifyIds, getNodeText;

		this.VERSION = '0.6.2';

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
						ids  = core.ids   = [],
						$assets = $('#jsvg-assets');

					$svg.find('[id]').each(function(index, item) {
						ids.push(item.id);
					});

					if (options.appendToDom) {
						if (!$assets.length) {
							$assets = $('<div>', { id: 'jsvg-assets', 'class': 'jsvg-assets' });
							$('body').append($assets);
						}
						$assets.append($svg);
					}
				})
				.fail(function(data) {
					throw new Error("Could not load svg file: "+options.url);
				});

			return xhr;
		};

		this.get = function(id, opt_) {
			if (id && id[0] === '#') { id = id.slice(1); }

			var
				opt = $.extend(true, {
					className : '',
					unify     : options.unify,
					useTag    : false
				}, opt_),

				$sprite = cache.sprites[id],

				findItem = function() {
					var
						$item = cache.$svg.find('#'+id);

					if (!$item[0]) {
						throw new Error("Could not find svg element #"+id);
					}

					return $item;
				},
				findSvgNode = function($item) {
					if ($item.is('svg')) { return $item; }

					return $item.closest('svg');
				},

				$svg, $item, $body;

			if (opt.useTag) {
				$item = findItem();
				$svg = findSvgNode($item);

				$sprite = $svg.clone().empty();

				$sprite
					.removeAttr('id')
					.append('<use xlink:href="#'+id+'">');
			} else
			if (!$sprite) {
				$item = findItem();
				if ($item.is('svg')) {
					$sprite = $item.clone();
				}
				else {
					$svg    = findSvgNode($item);
					$sprite = $svg.clone().empty();
					$body   = $item.clone();

					$body
						.removeAttr('id')
						.attr('display', 'inherit');

					$sprite.append($body);
				}

				$sprite.removeAttr('id');

				cache.sprites[id] = $sprite.clone();
			}

			if (opt.unify) {
				$sprite = unifyIds($sprite, opt.unify);
				// set unified id
				$sprite[0].id = alterId(id, unifyOptions);
			}

			$sprite = $sprite.clone();

			// custom class
			if (opt.className) {
				addClass($sprite[0], opt.className);
			}

			// copy id to class
			addClass($sprite[0], id);

			return $sprite;
		};

		this.getIds = function() {
			return core.ids;
		};

		this.getOption = function(key) {
			return options[key];
		};

		this.getUnifyOptions = function() {
			return unifyOptions;
		};

		/* --- private --- */

		addClass = function(el, cls) {
			var current = el.className.baseVal;

			return el.className.baseVal = _trim(current+' '+cls);
		};

		alterId = function(id, opt_) {
			var
				opt = $.extend({
					'prefix': '',
					'suffix': ''
				}, opt_);

			return String(opt.prefix+id+opt.suffix);
		};

		unifyIds = function($sprite, opt_) {
			var
				opt = $.extend({
					'prefix': '',
					'suffix': '-'+_makeId(3)
				}, opt_),

				re_is_sequence = /.+[0-9]$/,
				is_sequence    = function(str) {
					return re_is_sequence.test(str);
				},
				ids = [],

				sprite;


			$sprite.find('[id]').each(function(index, item) {
				if (options.copyIdsToClasses) {
					addClass(item, item.id);
				}
				ids.push(item.id);
			});

			sprite = getNodeText($sprite[0]);

			ids.forEach(function(id) {
				var
					str = '(#|id=")('+id+')(")',
					re = new RegExp(str, 'g');

				sprite = sprite.replace(re, '$1'+alterId(id, opt)+'$3');
			});

			$sprite = $(sprite);

			// save unfiy options
			unifyOptions = opt;

			return $sprite;
		};

		getNodeText = function(el) {
			var div = document.createElement('div');

			div.appendChild(el.cloneNode(true));

			return div.innerHTML;
		};


		this.init();
	};

})(window.$sa, window.jQuery);
