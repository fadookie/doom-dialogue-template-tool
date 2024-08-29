#!/usr/bin/env bash

# This is an example of how to invoke the template-tool to build dialogue from templates.
# If you are on windows you won't be able to run this script directly without a unix shell environment
# but you can use a similar invocation of node from the command prompt.

set -o errexit
set -o pipefail
set -o nounset

cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.."
pwd

# Actually invoke the template-tool:
node template-tool.js --templates-dir examples/dialogue_templates/ --out-file examples/test_merged.usdf --header examples/test-header.template.usdf --template-extension .template.usdf --verbose

