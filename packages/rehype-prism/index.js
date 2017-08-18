const prism = require("prismjs");

const NodeTypes = {
    TEXT: "text",
    ELEMENT: "element"
};

const NodeTagNames = {
    CODE: "code",
    SPAN: "span"
};

/**
 * @returns {Function} transform function
 **/
function plugin() {

    /**
     * @param {hash} tree is ast tree
     * @returns {null} not return
     **/
    function transformer(tree) {
        if (tree.tagName !== NodeTagNames.CODE) {
            if (!tree.children) {
                return;
            }

            tree.children.map(transformer);
            return;
        }

        if (!tree.properties || !tree.properties.className) {
            return;
        }

        const grammer = Array.from(tree.properties.className)
              .filter(name => name.match(/^language-[\w]+/))
              .map(name => name.split("-")[1])
              .map(lang => prism.languages[lang])
              .reduce((acc, curr) => {
                  if (acc) {
                      return acc;
                  }

                  return curr;
              });

        if (!grammer) {
            return;
        }

        const children = tree.children.reduce((acc, node) => {
            if (node.type !== NodeTypes.TEXT) {
                return acc.concat(node);
            }

            return prism.tokenize(node.value, grammer).map(token => {
                if (token instanceof Object) {
                    const { type, content } = token;

                    return {
                        type: NodeTypes.ELEMENT,
                        tagName: NodeTagNames.SPAN,
                        properties: {
                            className: [type, "token"]
                        },
                        children: [{
                            type: NodeTypes.TEXT,
                            value: content,
                            position: tree.position // FIXME
                        }],
                        position: tree.position // FIXME
                    };
                }

                return {
                    type: NodeTypes.TEXT,
                    value: token,
                    position: tree.position // FIXME
                };
            });
        }, []);

        tree.children = children;
    }

    return transformer;
}

module.exports = plugin;
