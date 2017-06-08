# Stencil 
## A Templating Engine
```
    <h1>Welcome</h1>
    <p><b>Stencil makes it easy to write reusable HTML templates.</b></p>
    <p>Stencil uses HTML as its templating language.  Any valid HTML is a valid template.</p>
    <p>Stencil is easy to extend. All of Stencil's built-in features were created using the same API available to you.</p>

    <h2>Expressions</h2>
    <script>

        var Stencil = require('stencil');

        // Expressions are surrounded by double curly braces:
        var stencil = new Stencil('<p>{{greeting || "Hi."}}</p>');
        var model = {greeting: 'Hello!'};

        console.log(stencil.render(model));    // <p>Hello!</p>
        console.log(stencil.render());         // <p>Hi.</p>

    </script>


    <h2>Filters</h2>
    <script>

        var Stencil = require('stencil');

        // Expressions are surrounded by double curly braces:
        var stencil = new Stencil('<p>{{"Hello!"|uppercase}}</p>');

        console.log(stencil.render());  // <p>HELLO!</p>

    </script>
    

    <h2>Conditions</h2>
    <script>

        var Stencil = require('stencil');

        // if/elseif/else atrributes conditionally render elements:
        var html = '<p if="greeting">{{greeting}}</p>' + 
                   '<p else>...</p>';

        var stencil = new Stencil(html);
        var model = {greeting: "Hi."};

        console.log(stencil.render(model));  // <p>Hi.</p>
        console.log(stencil.render());       // <p>...</p>

    </script>


    <h2>Looping</h2>
    <script>

        var Stencil = require('stencil');

        // The each attribute repeats an element:
        var html = '<p each="greetings as greeting">{{@index + 1}}: {{greeting}}</p>";

        var stencil = new Stencil(html);
        var model = {greetings: ["Hello!", "Hi.", "*nod*"]};

        console.log(stencil.render(model));    // <p>1: Hello!</p>
                                               // <p>2: Hi.</p>
                                               // <p>3: *nod*</p>

    </script>


    <h2>Substencils</h2>
    <script>

        var Stencil = require('stencil');

        var html = '<div><stencil name="greeting"/></div>';
        var subhtml = '<p>Hi.</p>';

        var stencil = new Stencil(html);
        var substencil = new Stencil(subhtml);

        stencil.include({greeting: substencil});

        console.log(stencil.render(model));    // <div><p>Hi.</p></div>
                                               
    </script>


    <h2>Null Elements</h2>
    <script>

        var Stencil = require('stencil');

        // The each attribute repeats an element:
        var html = '<x>Hello!</x>';
        
        var stencil = new Stencil(html);

        console.log(stencil.render(model));    // Hello!
                                               
    </script>
    
    
    <h2>Two-Way Binding</h2>
    <script>

        var Stencil = require('stencil');

        var html = '<p>{{greeting}}</p>';
        
        var stencil = new Stencil(html);
        var model = {greeting: "Hi."}

        var target = document.body;

        // <p>Hi.</p> will be injected into the <body> tag.
        // If a target is not specified, the default is document.body:
        stencil.bind(target, model);

        // The body tag will be updated to <p>Hi!</p>.
        model.greeting = "Hi!";
        model.update();
                                               
    </script>


    <h2>Event Binding</h2>
    <script>

        var Stencil = require('stencil');

        var html = '<p onclick="{{sayHello}}">Click me!</p>';
        
        var stencil = new Stencil(html);
        var model = {
            sayHello: fuction(event) {
                alert("Hello!");
            }
        };

        // <p>Click me!</p> will be injected into the <body> tag,
        // and clicking it will cause the sayHello method of the 
        // model to be invoked.
        stencil.bind(model);
                                               
    </script>


