/* jshint node: true, esversion: 6, undef: true, unused: true */
function Scratchpad(rootScope, boundElement) {

    var nodes = [],
        models = [],
        stencils = [],
        scopes = [],
        scopeLatches = [],
        elements = [],
        currentIndex = -1,
        virtualNode;
    

    /**
     * Pushes a new node onto the stack.
     * 
     * @param {object} node The new node
     * @param {model} model The new model
     * @param {Stencil} stencil The stencil rendering the node
     * @private
     */
    function push(node, model, stencil) {
        
        currentIndex++;

        nodes[currentIndex] = node;
        models[currentIndex] = model;
        stencils[currentIndex] = stencil;
        elements[currentIndex] = {};
        scopes[currentIndex] = scopes[currentIndex - 1] || rootScope;
        scopeLatches[currentIndex] = false;

        // If we are binding an element, we need to keep track of the model tree:
        if (boundElement) {
            
            let childNode = {
                node: node, 
                model: model, 
                stencil: stencil, 
                scope: scopes[currentIndex], 
                parent: virtualNode, 
                children: []
            };
            
            if (virtualNode) {
                virtualNode.children.push(childNode);
            }
            virtualNode = childNode;
        }
    }


    /**
     * Pops a node from the stack, restoring the previous state.
     * 
     * @private
     */
    function pop() {
        
        currentIndex--;

        if(boundElement) {
            virtualNode = virtualNode.parent;
        }
    }


    // Start the stack with a root scope, and nothing else:
    rootScope = Object.create(rootScope || {});
    push();

    /**
     * The public interface for the scratchpad.
     *
     * @prop  {object} node The current node
     * @prop  {object} model The current model
     * @prop  {Stencil} stencil The current stencil
     * @prop  {object} element A place to store variables that should only be available to the current state.
     * @prop  {object} scope A place to store variables that should be availabile to this node, and all children. 
     * @prop  {object} root The root scope
     * @prop  {} push A method that adds a new node to the stack.
     * @prop  {} pop A method that restores the previous node.
     * 
     * TODO: Refactor these...
     * @prop  {object} parent The previous state in the stack
     * @prop  {Stencil} previosStencil The previous stencil
     */
    var interface = {
        
        get node() {return nodes[currentIndex];},
        set node(node) {nodes[currentIndex] = node;},
        
        get model() {return models[currentIndex];},
        set model(model) {
            
            models[currentIndex] = model;
            
            if (virtualNode) {
                virtualNode.model = model;
            }
        },
        
        get element() {return elements[currentIndex];},
        set element(element) {elements[currentIndex] = element;},
        get parent() {return elements[currentIndex - 1];},

        get stencil() {return stencils[currentIndex];},
        set stencil(stencil) {stencils[currentIndex] = stencil;},
        previousStencil: function(index) {
            return stencils[currentIndex + index];
        },

        get scope() {return scopes[currentIndex];},
        get root() {return scopes[0];},
        newScope: function() {

            // We should only create one new scope per state. But, if
            // we haven't already created one, do so now:
            if(!scopeLatches[currentIndex]) {
                scopes[currentIndex] = Object.create(scopes[currentIndex]);
                scopeLatches[currentIndex] = true;
            }
        },

        boundElement: boundElement,
        
        virtualDom: virtualNode,
                
        push: push,
        pop: pop
    };

    return interface;
}

module.exports = Scratchpad;