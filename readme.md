# Stencil 
## A Templating Engine
```
    <h1>Welcome</h1>
    <p><b>Stencil makes it easy to write reusable HTML templates.</b></p>
    <p>Stencil uses HTML as its templating language.  Any valid HTML is a valid template.</p>
    <p>Stencil is easy to extend. All of Stencil's built-in features were created using the same API available to you.</p>

    <h2>Expressions</h2>
    <script>

        // Expressions are surrounded by double curly braces:
        var stencil = new Stencil('<p>{{greeting || "Hi."}}</p>');

        var Stencil = require('stencil');
        var model = {greeting: 'Hello!'};

        console.log(stencil.render(model));    // <p>Hello!</p>
        console.log(stencil.render());         // <p>Hi.</p>

    </script>


    <h2>Filters</h2>
    <script>

        // Filters can transform the value of an expression:
        var stencil = new Stencil('<p>{{"Hello!"|uppercase}}</p>');

        var Stencil = require('stencil');

        console.log(stencil.render());         // <p>HELLO!</p>

    </script>
    

    <h2>Conditions</h2>
    <script>

        // if/elseif/else atrributes conditionally render elements:
        var html = '<p if="greeting">{{greeting}}</p>' + 
                   '<p else>...</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var model = {greeting: "Hi."};

        console.log(stencil.render(model));  // <p>Hi.</p>
        console.log(stencil.render());       // <p>...</p>

    </script>


    <h2>Looping</h2>
    <script>

        // The each attribute repeats an element:
        var html = '<p each="greetings as greeting">{{@index + 1}}: {{greeting}}</p>";

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var model = {greetings: ["Hello!", "Hi.", "*nod*"]};

        console.log(stencil.render(model));    // <p>1: Hello!</p>
                                               // <p>2: Hi.</p>
                                               // <p>3: *nod*</p>

    </script>


    <h2>Substencils</h2>
    <script>

        var html = '<div><stencil name="greeting"/></div>';
        var subhtml = '<p>Hi.</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);            // A stencil...
        var substencil = new Stencil(subhtml);      // ...that uses another stencil.

        stencil.include({greeting: substencil});

        console.log(stencil.render(model));    // <div><p>Hi.</p></div>
                                               
    </script>


    <h2>Using "this"</h2>
    <script>

        var html = '<p>{{this}}</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var model = "Hi...";

        console.log(stencil.render(model));    // <p>Hi...</p>

    </script>


    <h2>Changing Scope</h2>
    <script>

        var html = '<p scope="data">{{greeting}}</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var model = {data: {greeting: "Hi!"}};

        console.log(stencil.render(model));    // <p>Hi!</p>
                                               
    </script>


    <h2>Naming a Scope</h2>
    <script>

        // A scope can be given a name:
        var html = '<p scope="data as special">{{special.greeting}}</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var model = {data: {greeting: "¡Hola!"}};

        console.log(stencil.render(model));    // <p>¡Hola!</p>
                                               
    </script>    


    <h2>Null Elements</h2>
    <script>

        // The tag portion of a null element isn't rendered:
        var html = '<x>Hello!</x>';
        
        var Stencil = require('stencil');
        var stencil = new Stencil(html);

        console.log(stencil.render(model));    // Hello!
                                               
    </script>


