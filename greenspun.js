// Greenspun.js compiles not-quite-JavaScript into standard JS. Its purpose
// is to allow experimentation with various language features in the JavaScript
// runtime, many of which are inspired by Common Lisp. The name comes from
// "[Greenspun's 10th Rule of Programming](http://c2.com/cgi/wiki?GreenspunsTenthRuleOfProgramming)",
// which states:
// > Any sufficiently complicated C or Fortran program contains an ad hoc,
// > informally-specified, bug-ridden, slow implementation of half of Common
// > Lisp.

// ## License
// Copyright 2013 Patrick Dubroy. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

// ## Finding Scripts

// Wrap the code in an immediately-invoked function expression.
;(function() {

// Find all `<script>` tags on the page that have the type `text/greenspun-js`.
// If a tag has the `src` attribute, load its contents using `loadResource`.
var scripts = document.querySelectorAll('script[type="text/greenspun-js"]');
for (var i = 0; i < scripts.length; i++) {
  if (scripts[i].hasAttribute('src'))
    loadResource(scripts[i].src, transform.bind(scripts[i]));
}

// ## Loading Script Source

// `loadResource` loads a script from the given url and calls
// `fncOfContentOrNull` with the contents of the script, or null if the request
// fails. This implementation comes from the [Traceur
// Compiler](https://github.com/google/traceur-compiler/).
function loadResource(url, fncOfContentOrNull) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.addEventListener('load', function(e) {
    if (xhr.status == 200 || xhr.status == 0)
      fncOfContentOrNull(xhr.responseText);
  });
  var onFailure = function() {
    fncOfContentOrNull(null);
  };
  xhr.addEventListener('error', onFailure, false);
  xhr.addEventListener('abort', onFailure, false);
  xhr.send();
}

// ## Compilation

// `transform` compiles script source to standard JavaScript, and inserts
// a new script tag on the page to be executed.
function transform(source) {
  // First, parse the script into an abstract syntax tree.
  var ast = esprima.parse(source);

  // Then, walk the AST looking for function declarations and function
  // expression nodes. Transform those nodes to implement dynamic scoping.
  _.walk.postorder(ast, function(node) {
    if (!node) return;

    if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression') {
      implementDynamicScope(node);
    }
  });

  // Finally, append a new script tag to the document head with the transpiled
  // code.
  var scriptEl = document.createElement("script");
  scriptEl.type = "text/javascript";
  scriptEl.text = escodegen.generate(ast);
  document.querySelector("head").appendChild(scriptEl);
}

// ## Dynamic Scoping Implementation
// Implements dynamic scoping for a given syntax tree node by wrapping
// the function body in a try/finally statement. Before the try statement,
// insert a statement that pushes a new scope onto the scope stack, and
// in the finally statement, pop that scope off the stack again.
function implementDynamicScope(node) {
  var newAst = esprima.parse(
      'dynamic = { "__proto__": dynamic };\n' +
      'try {} finally { dynamic = dynamic.__proto__; }');
  var newBody = newAst.body;
  var originalBody = node.body.body;
  node.body.body = newBody;
  newBody[1].block.body = originalBody;
}

// Close and invoke the function expression.
})(); // function()

// Declare the top-level dynamic scope.
var dynamic = {};
