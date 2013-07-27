(function() {

// Swiped from https://github.com/google/traceur-compiler/.
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

function implementDynamicScope(node) {
  var newAst = esprima.parse(
      'dynamic = { "__proto__": dynamic };\n' +
      'try {} finally { dynamic = dynamic.__proto__; }');
  var newBody = newAst.body;
  var originalBody = node.body.body;
  node.body.body = newBody;
  newBody[1].block.body = originalBody;
}

function transform(source) {
  var ast = esprima.parse(source);

  var functionBody =

  // Walk the AST and insert the function preamble as the first statement
  // in every function in the tree
  _.walk.postorder(ast, function(node) {
    if (!node) return;

    if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression') {
      implementDynamicScope(node);
    }
  });

  // Append a new script tag to the document head with the transpiled code.
  var scriptEl = document.createElement("script");
  scriptEl.type = "text/javascript";
  scriptEl.text = escodegen.generate(ast);
  document.querySelector("head").appendChild(scriptEl);
}

var scripts = document.querySelectorAll('script[type="text/greenspun-js"]');
for (var i = 0; i < scripts.length; i++) {
  loadResource(scripts[i].src, transform.bind(scripts[i]));
}

})(); // function()

var dynamic = {};