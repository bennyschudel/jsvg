#!/usr/bin/env python

import sys
import os
import argparse
import glob
import re
import gzip

VERSION = '0.5.2'

RE_STRIP_WHITESPACES = re.compile(r'([\t\n\r])')
RE_CLEAN_MULTISPACES = re.compile(r' {2,}')
RE_FIND_SVG = re.compile(r'<svg\b[^>]*>(?!<svg).*?</svg>')
RE_FIND_IDS = re.compile(r'<([a-zA-Z0-9_]*)[^>]*id="([^"]*)')
RE_IS_SEQUENCE = re.compile(r'^[a-zA-Z]+[0-9_]+$')

idIterator = 0

def getvar(var, default):
	return default if not var else var


def sizeof_fmt(num):
	for x in ['B','K','M','G']:
		if num < 1024.0:
			return '%3.1f%s' % (num, x)
		num /= 1024.0
	return '%3.1f%s' % (num, 'T')


def unifySequencedIds(svg, prefix='jsvg_'):
	global idIterator

	ids = RE_FIND_IDS.findall(svg)
	for match in ids:
		tag, id = match
		if RE_IS_SEQUENCE.match(id):
			idIterator += 1
			newId = '%s%s' % (prefix, idIterator)
			svg = re.sub(r'(?<=id=")(%s)(?=")' % id, newId, svg)
			svg = re.sub(r'(?<=#)%s(?=["\)\s])' % id, newId, svg)
	return svg


def normpath(dir):
	return os.path.normpath(dir) + os.sep


def process(args):
	svgs = []

	name = getvar(args.name, 'package')
	sdir = normpath(getvar(args.srcdir, 'svg/'))
	ddir = normpath(getvar(args.destdir, os.getcwd()))

	for dir in sdir, ddir:
		if not os.path.isdir(dir):
			sys.exit("ERROR: dir '%s' does not exists" % dir)

	data = '<?xml version="1.0" encoding="UTF-8"?>\n<svg style="display: none">\n\t<defs>\n\t\t'
	for fname in glob.glob('%s*.svg' % sdir):
		file = open(fname, 'r')
		content = file.read()
		content = re.sub(RE_CLEAN_MULTISPACES, ' ', content)
		content = re.sub(RE_STRIP_WHITESPACES, '', content)
		content = unifySequencedIds(content, '%s_' % name)
		svgs += RE_FIND_SVG.findall(content)
	data += '%s\n\t</defs>\n</svg>' % '\n\t\t'.join(svgs)

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