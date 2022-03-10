# GitGet

## Summary
A simple JavaScript webapp which queries the GitHub API to obtain information about a given account's public repositories. 
It receives the information from the API in JSON and summarizes it into a more condensed form. The user is given the option to
have the program return its data or write it to a file.

This program can be run as a script or imported and run in another program. Just call exports.main() inside the file or import it
and call the main() function.

**Call within GitGet.js:**
`exports.main(<target username>, <auth token path>, <mode: 'return' or 'write'>, <output path>);`
*Note: output path is only needed if in write mode.*

**Call in another program:**
`const GitGet = require(<path to GitGet.js>);
exports.main(<target username>, <auth token path>, <mode: 'return' or 'write'>, <output path>);`

---

## License
GitGet - A basic JavaScript program used to query the GitHub API using the NPM @octokit/rest module for Node.js.
Copyright (C) 2022  Cade Wormington

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.