## Minimum Perimeter Triangle Enclosing a Convex Polygon

An implementation of the algorithm given in the [paper](http://link.springer.com/chapter/10.1007/978-3-540-44400-8_9)
This is an improved implementation as compared to the one described
[here](http://web.cs.dal.ca/~cccg/papers/26.pdf). The main difference is that
the former implementation fails whenever a polygon contains a vertical edge,
this --- doesn't.

### Building

This produces directory `web`:

	npm install
	bower install
	grunt

An example is contained in `web/demo/showcase.html`.
Data for examples are taken from the minimum area enclosing triangle
[repository](https://github.com/IceRage/minimal-area-triangle/tree/master/data/random_convex_polygon_sample)

### License

MIT License


