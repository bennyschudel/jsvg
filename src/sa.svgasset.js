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
				dataType: 'text',
				context: {
					asset: self
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

				throw new Error("Could not load svg file: "+opt.url);
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
