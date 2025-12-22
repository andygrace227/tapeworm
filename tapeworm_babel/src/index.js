
/**
 * This is a Babel plugin that attempts to make writing tools very easy.
 * It searches for Tools that extend Tapeworm/Tool, and attempts to create
 * the boiler plate for the methods.
 * 
 * Example usage:
 * @example
 * ```js
 * 
 * @Tool({name:"Sample tool (this is optional if class isn't anonymous)",description:"Performs some basic string concatenation")
 * class SampleTool extends Tool {
 *
 *   @TParam({name: "a", type:"string", required: "yes", description:"first string"})
 *   @TParam({name: "b", type:"string", required: "yes", description:"second string"})
 *   @TOutput("A string equal to <a>.<b>")
 *   execute({a,b}) {
 *      return a + "." + b
 *   }
 * }
 * 
 * ```
 * 
 * This will be translated to:
 * 
 * @example
 * ```js 
 * class SampleTool extends Tool {
 * 
 *   getName() {
 *      return "SampleTool";
 *   }
 * 
 *   getDescription() {
 *      return "Performs some basic string concatenation";
 *   }
 *
 *   getToolSchema {
 *      return ToolSchema.builder()
 *        .addParameter(
 *             Parameter.builder()
 *             .name("a")
 *             .description("first string.")
 *             .required(true)
 *             .type("string")
 *             .build(),
 *         )
 *         .addParameter(
 *             Parameter.builder()
 *             .name("b")
 *             .description("second string.")
 *             .required(true)
 *             .type("string")
 *             .build(),
 *         )
 *         .output("A string equal to <a>.<b>")
 *         .build();
 *   }   
 * 
 *   execute({a,b}) {
 *      return a + "." + b
 *   }
 * }
 * ```
 * 
 * 
 * @param {*} param0 
 * @returns 
 */
export default function ({ types: t }) {

    function getTracerString(state, path) {
        const fileName = state?.file?.opts?.filename ?? "Unknown file";
        const lineNumber = path?.node?.loc ? path?.node?.loc?.start?.line : "Unknown";
        return " \x1b[90m[File: " + fileName + ", line " + lineNumber + "]\x1b[0m"
    }

    function getTapewormSignature(color = "03") {
        return "\x1b[" + color + "m[Tapeworm]\x1b[0m ";
    }

    function info(state, path, str) {
        console.log(getTapewormSignature("34") + str + getTracerString(state, path));
    }

    function warn(state, path, str) {
        console.log(getTapewormSignature("31") + str + getTracerString(state, path));
    }

    function debug(state, path, str) {
        console.log(getTapewormSignature("32") + str + getTracerString(state, path));
    }

    function classHasMethod(node, methodName) {
        return node.body.body.some(fn => {
            if (t.isClassMethod(fn) || t.isClassPrivateMethod(fn)) {

                const tMethodName = t.isClassPrivateMethod(fn) ? fn.key.id : fn.key.name;
                return methodName === tMethodName;
            }
            return false;
        });
    }

    function ensureImport(path, names, source) {
        const program = path.findParent((p) => p.isProgram());
        const existingImports = program.get("body").find(
            (stmt) =>
                stmt.isImportDeclaration() && stmt.node.source.value === source
        );

        if (existingImports) {
            const specNames = new Set(existingImports.node.specifiers.map(
                (s) => s.imported && s.imported.name
            ));
            names.forEach((n) => {
                if (!specNames.has(n)) {
                    existingImports.pushContainer(
                        "specifiers",
                        t.importSpecifier(t.identifier(n), t.identifier(n))
                    );
                }
            });
        } else {
            program.unshiftContainer(
                "body",
                t.importDeclaration(
                    names.map((n) => t.importSpecifier(t.identifier(n), t.identifier(n))),
                    t.stringLiteral(source)
                )
            );
        }
    }


    return {
        visitor: {
            ClassDeclaration(path, state) {

                // Determine if this is a relevant class to annotate.
                const superClass = path.node.superClass;
                if (!superClass || superClass.name !== "Tool") {
                    debug(state, path, "Class is not a tool, skipping.");
                    return;
                }

                // Determine if any decorators exist on the tool. If not, skip.
                const toolDecorator = (path.node.decorators || []).find(
                    (decorator) => decorator?.expression?.callee?.name === "Tool"
                );

                if (toolDecorator == undefined) {
                    debug(state, path, "Tool does not contain a decorator. Skipping.")
                    return;
                }

                // Determine if the parameter types are correct. If not, warn and return.
                if (toolDecorator?.expression?.arguments?.length != 1
                    || toolDecorator?.expression?.arguments[0]?.type != "ObjectExpression"
                ) {
                    warn(state, path, "Class does not have a valid Tool decorator. Skipping.");
                    return;
                }

                // Collect the information contained in the Tool annotation.
                let annotationArguments = {};
                toolDecorator.expression.arguments[0].properties.forEach((prop) => {
                    annotationArguments[prop.key.name] = prop.value.value;
                });

                debug(state, path, "Tool decoration has been found.")

                // Attempt to get the tool name and description
                // If neither are found, warn the user and stop processing.
                if ("name" in annotationArguments == false) {
                    debug(state, path, "No explicit name parameter in decorator. Attempting to resolve tool name from class name.")
                }

                let toolName = annotationArguments["name"] ?? (path.node.id ? path.node.id.name : undefined);
                if (toolName === undefined) {
                    warn(state, path, "This tool does not have a valid name. Skipping.");
                    return;
                }
                let toolDescription = annotationArguments["description"] ?? undefined;
                if (toolDescription === undefined) {
                    warn(state, path, "This tool does not have a valid description. Skipping any other processing for " + toolName + ".");
                    return;
                }

                // Happy case. We can create the name and description methods for
                // this tool.
                info(state, path, "Tool identified: " + toolName);


                // Create the methods if they exist.
                const addedMethods = []

                if (!classHasMethod(path.node, "getName")) {
                    debug(state, path, `${toolName} does not have a getName method. Adding.`)

                    addedMethods.push(
                        t.classMethod("method", t.identifier("getName"), [], t.blockStatement([
                            t.returnStatement(t.stringLiteral(toolName)),
                        ]))
                    );
                }

                if (!classHasMethod(path.node, "getDescription")) {
                    debug(state, path, `${toolName} does not have a getDescription method. Adding.`)


                    addedMethods.push(
                        t.classMethod("method", t.identifier("getDescription"), [], t.blockStatement([
                            t.returnStatement(t.stringLiteral(toolDescription)),
                        ]))
                    );
                }

                // Now handle the @TParam annotations.
                // These annotations exist on the execute method and are valid Parameter objects.

                const executeMethod = path.get("body.body")
                    .find((m) => t.isClassMethod(m) && m.node.key.name === "execute");

                if (executeMethod == undefined) {
                    warn(state, path, "No execute method was found for " + toolName);
                    return;
                }

                const parameterObjectExpressions = (executeMethod?.node.decorators || [])
                    .filter((decorator) => decorator?.expression?.callee?.name === "TParam")
                    .map((d) => {
                        const arg = d.expression.arguments[0];
                        return t.objectExpression(arg.properties);
                    });

                const parameterOutputExpression = (executeMethod?.node.decorators || [])
                    .filter((decorator) => decorator?.expression?.callee?.name === "TOutput")
                    .map((d) => {
                        const arg = d.expression.arguments[0];
                        return arg;
                    });

                if (parameterOutputExpression.length == 0) {
                    warn("No valid output in the tool schema. Make sure you include @TOutput. Aborting decoration processing.");
                    return;
                }

                if (!classHasMethod(path.node, "getToolSchema")) {

                    debug(state, path, `${toolName} does not have a getToolSchema method. Adding.`);
                    ensureImport(path, ["ToolSchema", "Parameter"], "@atgs/tapeworm");

                    addedMethods.push(
                        t.classMethod("method", t.identifier("getToolSchema"), [], t.blockStatement([
                            t.returnStatement(
                                t.newExpression(t.identifier("ToolSchema"), [
                                    t.arrayExpression(parameterObjectExpressions),
                                    parameterOutputExpression[0], // or another decorator for output
                                ])
                            ),
                        ]))
                    );
                }

                path.get("body").pushContainer("body", addedMethods);

                // Strip decorators.
                path.node.decorators = null;
                if (executeMethod) executeMethod.node.decorators = null;

            }
        }
    };
}