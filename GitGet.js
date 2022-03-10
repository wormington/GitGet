/*
    GitGet - A basic JavaScript program used to query the GitHub API using the NPM @octokit/rest module for Node.js.
    Copyright (C) 2022  Cade Wormington

    GitGet sends API queries to GitHub to obtain information about a given user's repositories. Make sure to modify
    the settings in var declarations (jsonPath, user) to your liking if you are not importing this file. To use, just call exports.main()
    in this file or simply main() if you have imported it. 
    
    exports.main(mode, tokPath) - mode: 'write' or 'return'. 'write' will write the received JSON to the file specified in 
                                  the jsonPath constant below. 'return' will cause the main() function to return the JSON as 
                                  a string.

                                  tokPath: The filepath which contains nothing except text of a user's GitHub API token. This
                                  is used to authenticate the API requests.
*/


/**
 *  ===== IMPORTS =====
 */
const { Octokit } = require('@octokit/rest');
const fsProm = require('fs').promises;

/**
 *  ===== VAR DECLARATIONS =====
 */
let username;
let token;
let repoList;
/**
 *  ===== FUNCTIONS =====
 */
const readAuth = async (filePath) => {
    await fsProm.readFile(filePath, 'utf8').then((fileData) => {
        token = fileData;
    }).catch((err) => {
        console.error(err);
    });
};

const pullData = (rawData) => {
    if (!rawData) {
        return;
    }
    let accum = [];
    // Pull only the important data. (name, updated_at, owner.login, description, html_url)
    for (let repoObj in rawData) {
        accum.push({
            name: rawData[repoObj].name,
            updated: rawData[repoObj].updated_at.replace('T', ' ').replace('Z',''),
            owner: rawData[repoObj].owner.login,
            description: (rawData[repoObj].description  || 'No description.'),
            url: rawData[repoObj].html_url
        });
    }

    return accum;
};

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
        sort: "updated",
        direction: "desc"
    });

    if (repoList.status === 200) {
        return pullData(repoList.data);
    }

    return null;
};


const writeJson = async (repoArr, writePath) => {
    await fsProm.writeFile(writePath, JSON.stringify(repoArr));
};

/**
 *  ===== SCRIPT =====
 */

exports.main = async (user, auth, mode, writeDir) => {
    username = user;
    await readAuth(auth);
    
    if (mode === "write") {
        if (!writeDir) {
            console.error("GitGet: write mode without output path.");
            return;
        }
        let data = await makeReq();
        if (data) {
            await writeJson(data, writeDir);
        }
    } else if (mode === "return") {
        return JSON.stringify(await makeReq());
    } else {
        console.error("GitGet: invalid mode. " + mode);
        return null;
    }
};

// exports.main("write");