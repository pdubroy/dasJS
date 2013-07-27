// Copyright 2013 Patrick Dubroy. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

// Set up a root binding.
dynamic.greeting = 'Hello!';

// Return the dynamically-scoped greeting, i.e. use the most recent binding
// for 'greeting' from the runtime call stack.
function greet() {
  return dynamic.greeting;
}

// Change the greeting to German and invoke the function 'f'.
function german(f) {
  dynamic.greeting = 'Guten Tag!';
  return f();
}

// Change the greeting to Bavarian and invoke the function 'f'.
function bavarian(f) {
  dynamic.greeting = 'Grüß Gott!';
  return f();
}

test('Dynamic scoping', function() {
  equal(greet(), 'Hello!');
  equal(german(greet), 'Guten Tag!');
  equal(bavarian(greet), 'Grüß Gott!');
  equal(bavarian(greet) && greet(), 'Hello!');
  equal(german(greet) && bavarian(greet), 'Grüß Gott!');
  equal(german(_.partial(bavarian, greet)), 'Grüß Gott!');
});
