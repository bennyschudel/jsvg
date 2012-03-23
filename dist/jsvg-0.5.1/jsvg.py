#!/usr/bin/env python

import sys
import os
import argparse
import glob
import re
import gzip

VERSION = '0.5.1'

RE_STRIP_WHITESPACES = re.compile(r'([\t\n\r]| {2,})')
RE_FIND_SVG = re.compile(r'<svg\b[^>]*>(?!<svg).*?</svg>')

def getvar(var, default):
	return default if not var else var


def sizeof_fmt(num):
	for x in ['B','K','M','G']:
		if num < 1024.0:
			return '%3.1f%s' % (num, x)
		num /= 1024.0
	return '%3.1f%s' % (num, 'T')


def process(args):
	svgs = []

	def normpath(dir):
		return os.path.normpath(dir) + os.sep

	name = getvar(args.name, 'package')
	sdir = normpath(getvar(args.srcdir, 'svg/'))
	ddir = normpath(getvar(args.destdir, os.getcwd()))

	for dir in sdir, ddir:
		if not os.path.isdir(dir):
			sys.exit("ERROR: dir '%s' does not exists" % dir)

	data = '<?xml version="1.0" encoding="UTF-8"?>\n<svg>\n\t'
	for fname in glob.glob('%s*.svg' % sdir):
		file = open(fname, 'r')
		content = file.read()
		content = re.sub(RE_STRIP_WHITESPACES, '', content)
		svgs += RE_FIND_SVG.findall(content)
	data += '%s\n</svg>' % '\n\t'.join(svgs)

	if not args.gzip:
		nfile = open('%s%s.svg' % (ddir, name), 'w')
		nfile.write(data)
		nfile.close()
		nsize = os.path.getsize(nfile.name)
		print "SUCCESS: %s created with %s" % (nfile.name, sizeof_fmt(nsize))

	if args.gzip:
		gfile = gzip.open('%s%s.svgz' % (ddir, name), 'w')
		gfile.write(data)
		gfile.close()
		gsize = os.path.getsize(gfile.name)
		print "SUCCESS: %s created with %s" % (gfile.name, sizeof_fmt(gsize))


def main():
	parser = argparse.ArgumentParser(description="Combines all svg files in a folder to a single svg file")
	parser.add_help
	parser.add_argument('--version', action='version', version=VERSION)
	parser.add_argument('--name', nargs='?', default='package', help="basename of the output file(s)")
	parser.add_argument('--srcdir', nargs='?', default='./assets/', help="input directory - that's where your svg(s) reside(s)")
	parser.add_argument('--destdir', nargs='?', default='.', help="output directory - that's where the file(s) should be written to")
	parser.add_argument('--gzip', action='store_true')

	try:
		args = parser.parse_args()
		process(args)

	except IOError, msg:
		parser.error(str(msg))

if __name__ == "__main__":
	main()