# jSVG - Simple JavaScript SVG Asset Management (uses jQuery)

I needed an easy way to integrate vector images for a project I was working on lately. My first thought was to (ab)use a font. However I don't like the work-flow and the update procedure is quite a pain - in my mind.

Wouldn't it be nice to save SVG's to a folder and use them directly in your browser? Thanks to modern browsers this is no dream anymore.

## Work-flow

1. Save all your SVG (1.1) files into an asset folder
2. Run the provided **jsvg.py** file to create a combined asset file
3. Use the SVGLoader class to load the asset file
4. Questions?

```javascript

var svgloader = $sa.SVGLoader.instance();

svgloader
	.load({
		url: 'icons.svgz'
	})
	.done(function() {
		var asset = svgloader.getAsset('icons'),
				$icon = asset.get('your-layer-name', 'optional class');

		$body.append($icon);
	});

```

### jsvg.py
Is a little python command line program to help you combine all your SVG files into a single one file.

> jsvg.py --help

I guess there's a way to observe the assets folder for file changes and then run the script automatically. I didn't had time to dig into that, so feel free to contribute.

I have also to mention that I have almost no Python skills so the code could be improved I guess. Again, any help would be much appreciated.

### FAQ
Q: What browsers are supported?
A: It's been tested on Firefox 11, Chrome 19, IE 9, Opera 11 on Mac OS Lion
   I didn't had time to check other browsers by now. Feel free to contribute.

### About me
My name is Benny Schudel. I'm Swiss and call myself New Media Engineer.
I would love to get feedback from you! My twitter handle is [@bennyschudel](http://twitter.com/bennyschudel). Thank's & enjoy!

#### LEGAL
Copyright (c) 2011 Benny Schudel - [MIT-License](LICENSE)