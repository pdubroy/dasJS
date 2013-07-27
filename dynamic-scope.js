dynamic.greeting = 'Hello!';

function greet() {
  return dynamic.greeting;
}

function german(f) {
  dynamic.greeting = 'Guten Tag!';
  return f();
}

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
