# Stencil Templating Engine
```
    <h1>Welcome</h1>
    <p>Stencil makes it easy to write reusable HTML templates.</p>

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

        // Expressions are surrounded by double curly braces:
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

        // The each attribute repeats an element:
        var html = '<div><stencil name="greeting"/></div>';
        var subhtml = '<p>Hi.</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var substencil = new Stencil(subhtml);

        console.log(stencil.render(model));    // <div><p>Hi.</p></div>
                                               
    </script>


    <h2>Substencils</h2>
    <script>

        var html = '<div><stencil name="greeting"/></div>';
        var subhtml = '<p>Hi.</p>';

        var Stencil = require('stencil');
        var stencil = new Stencil(html);
        var substencil = new Stencil(subhtml);

        stencil.include({greeting: substencil});

        console.log(stencil.render(model));    // <div><p>Hi.</p></div>
                                               
    </script>


    <h2>Null Elements</h2>
    <script>

        // The each attribute repeats an element:
        var html = '<x>Hello!</x>';
        
        var Stencil = require('stencil');
        var stencil = new Stencil(html);

        console.log(stencil.render(model));    // Hello!
                                               
    </script>


    <h2>Customization</h2>
    <p>All of Stencil's built-in features were created using the same API available to you. You can add:</p>

    <ul>
        <li>Expressions</li>
        <li>Attributes</li>
        <li>Elements</li>
        <li>Filters</li>        
    </ul>



