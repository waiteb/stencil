/* jshint node: true, esversion: 6, undef: true, unused: true */
function Scratchpad(document) {

    var stack = [],
        globals = {},
        currentState,
        interface;
            
    
    /**
     * Constructs a new scratchpad state
     * 
     * @constructor
     * @param  {object} node The current node
     */
    function State(node) {
        this.node = node;
        this.parent = stack[stack.length - 1];
        this.globals = globals;
        this.scope = currentState && currentState.scope && Object.create(currentState.scope) || {};
        this.stack = {};
    }

    /**
     * Pushes a new node onto the stack.
     * 
     * @param {object} node The new node
     * @private
     */
    function push(node) {
        stack.push(currentState);
        currentState = new State(node);
    }


    /**
     * Pops a node from the stack, restoring the previous state.
     * 
     * @private
     */
    function pop() {
        currentState = stack.pop();
    }

    /**
     * The public interface for the scratchpad.
     *
     * @prop  {object} node The current node
     * @prop  {object} globals The global state for the scratchpad
     * @prop  {object} stack A place to store variables that should only be available to the current node.
     * @prop  {object} scope A place to store variables that should be availabile to this node, and all children. 
     * @prop  {} push A method that adds a new node to the stack.
     * @prop  {} pop A method that restores the previous node.
     */
    interface = {
        get node() {return currentState.node;},
        get globals() {return currentState.globals;},
        get stack() {return currentState.stack;},
        get scope() {return currentState.scope;},
        get parent() {return currentState.parent;},
        push: push,
        pop: pop
    };

    // Begin with a fresh state:
    currentState = new State(document);

    return interface;
}

module.exports = Scratchpad;