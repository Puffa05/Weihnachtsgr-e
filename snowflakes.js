////////////////////////////////////////////////////////////////////////
// SnowFlakes-Script (c) 2022, Dominik Scholz / go4u.de Webdesign
////////////////////////////////////////////////////////////////////////

let snowflakes = (function() {

	///////////////////////////// configuration ////////////////////////////

	const defaultConfig = {
		amount: 40, // amount of flakes
		color: ['#AAAACC', '#DDDDFF', '#CCCCDD', '#F3F3F3', '#F0FFFF'], // random colors
		fontType: ['Arial Black', 'Arial Narrow', 'Times', 'Comic Sans MS'], //	random fonts
		flakeChar: '*', // char used for flake
		speed: .05, // speed of flakes
		size: [8, 22], // minimum/maximum flake font size
		drift: 15, // horizontal drift
	};
	
	///////////////////////////// private vars /////////////////////////////
	
	let config = {},
		flakes = [],
		bodyWidth = 0,
		bodyHeight = 0,
		count = 0,
		lastInterval = 0,
		initialized = false,
		running = false;

	////////////////////////////// functions ///////////////////////////////

	// auto start on document load
	function autostart(userConfig)
	{
		window.addEventListener('load', function() { start(userConfig); });
	}


	// start snow
	function start(userConfig)
	{
		if (running)
			return;

		running = true;
		config = mergeObjects(userConfig || {}, defaultConfig);
		resize();

		// add new flakes
		while (config.amount > flakes.length)
			createFlake(flakes.length);

		// init snowflakes
		if (!initialized)
		{
			initialized = true;
			window.addEventListener('resize', resize);

			let style = document.createElement('style');
			style.innerHTML = '.js-anim-snowflake { user-select: none; position: absolute; left: 0; top: 0; zIndex: 20000; }';
			document.getElementsByTagName('head')[0].appendChild(style);

			lastInterval = time();
			window.requestAnimationFrame(move);
		}
	}


	// stop snow
	function stop()
	{
		running = false;

		let i, l = flakes.length;
		for (i = 0; i < l; i++)
			if (flakes[i].y <= config.size[1])
				removeFlake(i);
	}


	// return running status
	function isRunning()
	{
		return running;
	}

	
	// creates a new snowflake
	function createFlake(i)
	{
		let el, f, s;
		
		if (!flakes[i])
		{
			// create new dom el
			el = document.createElement('div');
			el.className = 'js-anim-snowflake';
			el.innerHTML = config.flakeChar;
			flakes[i] = {
				el: el,
				x: 0,
				y: 0,
				size: 0,
				count: 0
			};
			document.getElementsByTagName('body')[0].appendChild(el);
		}

		f = flakes[i];

		// create flake object
		f.size = randomIntFromRange(config.size);
		f.x = randomIntFromRange([config.drift + 1, bodyWidth - config.drift - f.size - 3]);
		f.y = -f.size - randomIntFromRange([0, bodyHeight]);
		f.count = randomIntFromRange([0, 10000]);

		// init flake
		s = f.el.style;
		s.transform = 'translate(0, -' + f.size + 'px)';
		s.color = randomItemFromArray(config.color);
		s.family = randomItemFromArray(config.fontType);
		s.fontSize = f.size + 'px';

	}


	// remove an existing snowflake
	function removeFlake(i)
	{
		flakes[i].el.parentNode.removeChild(flakes[i].el);
		flakes[i] = null;
	}

	
	// move existing flakes
	function move()
	{
		window.requestAnimationFrame(move);
		
		// calculate movement factor
		let t = time(),
			dif = t - lastInterval,
			l = flakes.length,
			d = dif * config.speed * config.size[1],
			i, flake, x, y;
			
		lastInterval = t;
		count += dif * config.speed / 20;
		
		for (i = 0; i < l; i++)
		{
			if (null === flakes[i])
			{
				if (running)
					createFlake(i);
				else
					continue;
			}

			flake = flakes[i];
			flake.y += d / flake.size;
			
			// restart existing flake
			if (flake.y + flake.size >= bodyHeight)
			{
				if (running)
					createFlake(i);
				else
					removeFlake(i);
				continue;
			}

			x = flake.x + Math.sin(flake.count + count) * config.drift;
			y = flake.y;

			flake.el.style.transform = 'translate(' + Math.floor(x) + 'px, ' + Math.floor(y) + 'px)';
		}
	}
	

	// calculate new positions for all flakes
	function resize()
	{
		// save old width
		let oldWidth = bodyWidth;

		// get new width and height
		bodyWidth = getWindowWidth() - config.size[1];
		bodyHeight = getWindowHeight() - config.size[1];

		// calculate correction ratio
		let ratio = bodyWidth / oldWidth;
			
		// for all flakes
		for (let i = 0, l = flakes.length, flake; i < l; i++)
		{
			flake = flakes[i];
			if (!flake)
				continue;

			// do width correction
			flake.x *= ratio;
			
			// restart existing flake
			if ((flake.y + flake.size) >= bodyHeight)
				createFlake(i);
		}
	}
	
	
	// get window width
	function getWindowWidth()
	{
		let w = Math.max(self.innerWidth || 0, window.innerWidth || 0);
		
		if (document.documentElement)
			w = Math.max(w, document.documentElement.clientWidth || 0);
		if (document.body)
		{
			w = Math.max(w, document.body.clientWidth || 0);
			w = Math.max(w, document.body.scrollWidth || 0);
			w = Math.max(w, document.body.offsetWidth || 0);
		}
		
		return w;
	}

	
	// get window height
	function getWindowHeight()
	{
		let h = Math.max(self.innerHeight || 0, window.innerHeight || 0);
		
		if (document.documentElement)
			h = Math.max(h, document.documentElement.clientHeight || 0);
		if (document.body)
		{
			h = Math.max(h, document.body.clientHeight || 0);
			h = Math.max(h, document.body.scrollHeight || 0);
			h = Math.max(h, document.body.offsetHeight || 0);
		}
		
		return h;
	}


	// get current time
	function time()
	{
		return +new Date();
	}


	// return a random integer from a given range
	function randomIntFromRange(a)
	{
		return Math.floor(a[0] + Math.random() * (a[1] - a[0]));
	}


	// return a random array element
	function randomItemFromArray(a)
	{
		return a[Math.floor(Math.random() * a.length)];
	}


	// merge arrays
	function mergeObjects(a, b)
	{
		let i, c = {};
		for (i in b) { c[i] = b[i]; }
		for (i in a) { c[i] = a[i]; }
		return c;
	}


	// return public methods
	return {
		autostart: autostart,
		start: start,
		stop: stop,
		isRunning: isRunning
	}

}());

snowflakes.autostart();