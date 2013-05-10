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
			if (!len) { len = 6; }
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
				url         : '',
				index       : '',
				cache       : true,
				className   : null,
				appendToDOM : true
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

			unifyIds, getNodeText;

		this.VERSION = '0.5.8';

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

					if (options.appendToDOM) {
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
					className: '',
					unify: true
				}, opt_),
				className = _trim(_clean([id, options.className, opt.className].join(' '))),
				$sprite   = cache.sprites[id],
				$svg, $item, $body;

			// sprite is cached
			if (!$sprite) {
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

				$sprite.removeAttr('id');

				if ($body) {
					$sprite.append($body);
				}

				// store to cache
				cache.sprites[id] = $sprite.clone();
			}

			if (opt.unify) {
				$sprite = unifyIds($sprite, opt.unify);
			}

			$sprite = $sprite.clone();
			$sprite.attr('class', className);

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

		unifyIds = function($sprite, opt_) {
			var
				opt = $.extend({
					'prefix': '',
					'suffix': '-'+_makeId(3)
				}, opt_),
				re_is_sequence = /.+[0-9]$/,
				is_sequence = function(str) {
					return re_is_sequence.test(str);
				},
				sprite = getNodeText($sprite[0]),
				ids = [];

			$sprite.find('[id]').each(function(index, item) {
				if (!is_sequence(item.id)) { return; }

				ids.push(item.id);
			});

			ids.forEach(function(id) {
				var
					str = '(#|id=")('+id+')("|\\W)',
					re = new RegExp(str, 'g');

				sprite = sprite.replace(re, '$1'+opt.prefix+id+opt.suffix+'$3');
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
