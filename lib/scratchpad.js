/* jshint node: true, esversion: 6, undef: true, unused: true */
function Scratchpad(document, rootScope) {

    var stack = [],
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
        this.scope = currentState && currentState.scope && Object.create(currentState.scope) || rootScope || {}; // Yuck, but not worth refactoring...
        this.element = {};
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
        return (currentState = stack.pop());
    }

    /**
     * The public interface for the scratchpad.
     *
     * @prop  {object} node The current node
     * @prop  {object} root The root scope
     * @prop  {object} element A place to store variables that should only be available to the current state.
     * @prop  {object} scope A place to store variables that should be availabile to this node, and all children. 
     * @prop  {object} parent The previous state in the stack
     * @prop  {} push A method that adds a new node to the stack.
     * @prop  {} pop A method that restores the previous node.
     */
    interface = {
        get node() {return currentState.node;},
        set node(node) {currentState.node = node;},
        
        get model() {return currentState.scope.model;},
        set model(model) {currentState.scope.model = model;},
        
        get root() {return stack[0] && stack[0].scope || currentState.scope;},
        get scope() {return currentState.scope;},
        get element() {return currentState.element;},
        get parent() {return currentState.parent;},
        push: push,
        pop: pop
    };

    // Begin with a fresh state:
    currentState = new State(document);

    return interface;
}

module.exports = Scratchpad;