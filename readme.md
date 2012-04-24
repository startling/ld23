# a little place.

This is a game I wrote in 48 hours for [ludum dare 23](http://www.ludumdare.com/). It's meant to be a minimalistic play on the turn-based strategy genre. 


## post-mortem

It kind of sucks. Here's why:

* I didn't start out with a clear idea of what the game was going to be. It was originally called "forest floor", and was supposed to be a full-featured thing. It became clear that I couldn't pull that off quickly enough on sunday, and I siwtched tracks, stuck with my testing sprites, and made it what it is.
* I spent a lot of time writing engine code that could have been spent writing gameplay code, had an engine already existed.
* I very very clumsily implemented deferreds without knowing what they were and without any real consistency -- rather than defining a few generic primitives for them and re-using them, I wrote heavily specific code for each phase of play. It sucks. Today in #python, dash (a.k.a [Allan Short](http://washort.twistedmatrix.com)) mentioned that deferreds could be monads and it all clicked. I'd been tossing around an idea of implementing them as "monadic cooperative multitasking" -- now I know they already exist. I still think deferreds are the right thing for this kind of game, and I think I'll use that idea for my next thing.
* I had a sloppy additude towards the whole thing -- "who cares? I'll just be writing it for 48 hours. Might as well just copy-paste the subtitle writing everywhere rather than defining a function". I also didn't write any unit tests or anything, because who writes unit tests for javascript? ([lots](http://docs.jquery.com/Qunit) [of](http://www.jsunit.net/) [people](https://github.com/nkallen/screw-unit) [do](http://pivotal.github.com/jasmine/)). This bit me when lots of things broke and I didn't want to untangle knots to fix them.
* Lastly: I don't know javascript very well at all (but I know it a lot better now).

I learned a lot of things, though:

* Writing games is easy, easier than most code. I should do it more.
* The hardest parts of javascript are code organization and grokking events. After that, you're golden.
* Pixel art isn't hard -- I used [aseprite](http://www.aseprite.org), which has nice blur and jumble tools that do all the hard work.
* HTML5's canvas is *nice*.
