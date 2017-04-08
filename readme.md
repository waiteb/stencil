 <!-- stencil correct-headings: true, logic-level: 2 -->
    parse DOM:  https://azaslavsky.github.io/domJSON
    parse expressions:  http://jsep.from.so



    <p>Simple variable:  {{variable}}</p>
    <p>Neted variable:  {{foo.bar[baz][0]}}</p>
    <p>Root variable: {{#variable}}</p>
    <p>Context variable: {{@variable}}</p>


    <p>Filtered variable:  {{variable|uppercase}}</p>
    <p>Chained filters:  {{variable|reverse|uppercase}}</p>
    
    <x>Null element</x>
    <x each="variable as item">Loop over contents without container</x>

    <x each="object keys">


    <ul>
        <li each="list-item"></li>
    </ul>

    <dl>
        <x each="definition">
            <dt each="title">{{@this}}</dt>
            <dd each="definition">{{@this}}</dd>
        </x>
    </dl>

    
    <p if="foo && showFoo"></p>
    <p elseif="bar"></p>
    <p else></p>


    <h2>Logic level: 2</h2>

    <p>Conditional variable:  {{variable? "foo"}}</p>
    <p>Ternary condition:  Variable is {{foo? "truthy" : "falsey"}}</p>
    <p if="!foo && (bar || baz) > 0">Complex conditions (via http://jsep.from.so/?)</p>
    

    <div switch="foo">
        <p case="0, 2-3"></p>
        <p case="4"></p>
        <p case="5-6, 8"></p>
        <p default></p>
    </div>
    
    <div switch="foo">
        <p when="a"></p>
        <p when="b"></p>
        <p default></p>
    </div>


    <div log="Foo is: {{foo}}, {{@count}} debug="foo === 5"">

    {   
        openTag
        renderAttribute
        renderChildren
        renderChildElement
        closeTag
    }

    {
        plugins: [
            
        ]
    }


    var ifs = require("stencil-if"),
        switch = require("stencil-switch"),
        Stencil = require("stencil"),
        stencil;

    stencil = new Stencil(template, settings);

    stencil.render(model);
    
    

    


    
    
    

    




    <h2>DOM Property binding</h2>
    <p [style.color]="color"></p>
    <p [checked]=""></p>
