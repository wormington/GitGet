/*
    GitGet - A basic JavaScript program used to query the GitHub API using the NPM @octokit/rest module for Node.js.
    Copyright (C) 2022  Cade Wormington

    GitGet sends API queries to GitHub to obtain information about a given user's repositories. Make sure to modify
    the settings in var declarations (jsonPath, user) to your liking if you are not importing this file. To use, just call 
    exports.main() in this file or simply main() if you have imported it. 
    
    exports.main(user, auth, mode, writeDir) - user: The username of the user who we want to see the repositories of.

                                               auth: The filepath of the GitHub API authorization token which we want to 
                                               send the request with. Supplying this increases your API rate limit.
                                                
                                               mode: 'write' or 'return'. 'write' will write the received JSON to the file 
                                               specified in the jsonPath constant below. 'return' will cause the main() 
                                               function to return the JSON as a string.

                                               writeDir: The filepath which defines the location and name of the output 
                                               file. The name of the file should be included in the path.
*/


/*
    ===== IMPORTS =====
 */
const { Octokit } = require('@octokit/rest');
const fsProm = require('fs').promises;

/*
    ===== VAR DECLARATIONS =====
 */
let username;
let token;
let repoList;

/*
    ===== FUNCTIONS =====
 */

/**
 * readAuth() is a function which takes a filepath and opens the file
 * at that location. It then reads the text in that file as a GitHub
 * API token and stores it.
 * 
 * @param {string} filePath - the path to the file containing the token 
 */
const readAuth = async (filePath) => {
    await fsProm.readFile(filePath, 'utf8').then((fileData) => {
        token = fileData;
    }).catch((err) => {
        console.error(err);
        token = null;
    });
};

/**
 * pullData() filters through the data returned by the API call. A lot of info is
 * returned with this call, and we only want the data that we need.
 * 
 * @param {array: object} rawData - The array of objects which contain information about
 *                                  a user's GitHub repositories.
 * 
 * @returns - null if rawData is given an invalid array or an empty array.
 *            Otherwise, the array of repository objects with the targeted
 *            data is returned.
 */
const pullData = (rawData) => {
    if (!rawData || rawData.length === 0) {
        return null;
    }
    let accum = [];
    // Pull only the important data. (name, updated_at, owner.login, description, html_url)
    for (let repoObj in rawData) {
        accum.push({
            name: rawData[repoObj].name,
            updated: rawData[repoObj].pushed_at.replace('T', ' ').replace('Z',''),
            owner: rawData[repoObj].owner.login,
            description: (rawData[repoObj].description  || 'No description.'),
            url: rawData[repoObj].html_url
        });
    }

    return accum;
};

/**
 * makeReq() is the function which constructs and sends the request for repository information
 * to the GitHub API. It takes the result of the API call and passes it as a parameter to 
 * pullData() which cleans and filters the data. It then returns the clean data.
 * 
 * @returns - null if a HTTP response with a status other than '200 OK' is received.
 *            Otherwise, the clean data is returned.
 */
const makeReq = async () => {
    const kit = new Octokit({
        auth: token,
        userAgent: "GitGet v1.0",
        timeZone: "America/Chicago",
        baseUrl: "https://api.github.com",
        log: {
            debug: () => {},
            info: () => {},
            warn: console.warn,
            error: console.error
        }
    });

    repoList = await kit.rest.repos.listForUser({
        username: username,
        type: "public",
        sort: "pushed",
        direction: "desc"
    });

    if (repoList.status === 200) {
        return pullData(repoList.data);
    }

    return null;
};

/**
 * writeJson() is the function which writes the JSON data to a file if the user 
 * selects the 'write' mode.
 * 
 * @param {array: object} repoArr - The array of repositories which we want to write. 
 * @param {*} writePath - The path to the file we should write output to.
 */
const writeJson = async (repoArr, writePath) => {
    await fsProm.writeFile(writePath, JSON.stringify(repoArr));
};

/*
    ===== SCRIPT =====
 */

/**
 * main() is the primary function of the program. Call this to use GitGet.
 * 
 * @param {string} user      - The username of the user who we want to see the repositories of.
 * 
 * @param {string} auth      - The filepath of the GitHub API authorization token which we want to
                            send the request with. Supplying this increases your API rate limit.      

 * @param {string} mode      - mode: 'write' or 'return'. 'write' will write the received JSON to 
                            the file specified in the jsonPath constant below. 'return' will 
                            cause the main() function to return the JSON as a string.

 * @param {string} writeDir  - The filepath which defines the location and name of the output 
                            file. The name of the file should be included in the path.
 * 
 * @returns - the JSON string of repository objects if in 'return' mode.
 *          - null if an invalid mode is given.
 *          - nothing otherwise.
 */
exports.main = async (user, auth, mode, writeDir) => {
    username = user;
    await readAuth(auth);
    
    if (mode === "write") {
        if (!writeDir) {
            console.error("GitGet: write mode without output filepath.");
            return;
        }
        let data = await makeReq();
        if (data) {
            await writeJson(data, writeDir);
            return;
        }
    } else if (mode === "return") {
        let data = await makeReq();
        if (data) {
            return JSON.stringify(data);
        }
    } else {
        console.error("GitGet: invalid mode. " + mode);
        return null;
    }
};

// exports.main("<username>", "<authTokenPath>", "write", "./output.txt");