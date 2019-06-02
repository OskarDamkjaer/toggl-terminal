const axios = require('axios');
const promisify = require('util').promisify;
const homedir = require('os').homedir();
const fs = require('fs');
const config = require('./config.json');
const {
    minutesToString,
    calcDiffMin
} = require('./utils.js');


const projectPath = homedir + config.pathRelativeToHome + 'projects.json';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const toggl = axios.create({
    baseURL: 'https://www.toggl.com/api/v8/',
    auth: {
        username: process.env.TOGGL_API_KEY || config.api_token,
        password: 'api_token',
    },
});

const readProj = async () => {
    const rawFile = await readFile(projectPath);
    const {
        projects
    } = JSON.parse(rawFile);
    return projects;
};

const helper = (projects, {
    name,
    pid
}) => {
    if (name) {
        // make first letter capital by convention
        const wantedName = name.charAt(0).toUpperCase() + name.slice(1);
        return projects.find(item => item.name.startsWith(wantedName));
    } else {
        return projects.find(item => item.pid === pid);
    }
}

const privateFindProject = async ({
    name,
    pid
}) => {
    const projects = await readProj();
    const foundProj = helper(projects, {
        name,
        pid
    })

    if (foundProj) {
        return {
            project: foundProj,
            error: null
        }
    }

    const newProjects = await fetchProjects();

    const newAttempt = helper(newProjects, {
        name,
        pid
    })

    return newAttempt ? {
        project: newAttempt,
        error: null
    } : {
        project: null,
        error: `no project found matching ${name}`
    }
}

const privateCurrentTimer = async () => {
    try {
        const resp = await toggl('time_entries/current');
        const timer = resp.data.data;

        return timer ? {
            timer,
            error: null
        } : {
            timer: null,
            error: 'no timer running'
        }
    } catch (e) {
        return {
            timer: null,
            error: 'could not reach toggl'
        }
    }
}

const fetchProjects = async () => {
    const resp = await toggl('workspaces/1041293/projects');
    const projects = resp.data.map(item => ({
        name: item.name,
        pid: item.id
    }));
    await writeFile(projectPath, JSON.stringify({
        projects
    }));
    return projects
};

const getCurrent = async () => {
    const {
        timer,
        error
    } = await privateCurrentTimer()

    if (error) {
        return error
    }

    const {
        project,
        error: new_error
    } = await privateFindProject(timer);

    let projectName = 'no Project found';

    if (project) {
        projectName = project.name;
    }

    const diffMin = calcDiffMin(timer.start);
    return (
        projectName + ' (' + timer.description + ') for ' + minutesToString(diffMin)
    );
};

const stop = async () => {
    const {
        timer,
        error
    } = await privateCurrentTimer()

    if (error) {
        return error
    }

    // Now we must have a project
    const {
        project,
        error: new_error
    } = await privateFindProject(timer);

    if (new_error) {
        return new_error
    }

    await toggl.put('time_entries/' + timer.id + '/stop');

    return `stopped ${project.name} (${timer.description}), after ${minutesToString(calcDiffMin(timer.start))}`
};

const start = async (inProject, description = '') => {
    if (!inProject) {
        return 'no project entered'
    }

    await stop();

    const {
        project,
        error
    } = await privateFindProject({
        name: inProject
    })

    if (error) {
        return error
    }

    const {
        name,
        pid
    } = project

    try {
        await toggl.post('/time_entries/start', {
            time_entry: {
                description,
                pid,
                tags: [],
                created_with: 'curl',
            }
        });
        return 'started timer for ' + name;
    } catch (e) {
        return 'failed to start timer ' + e;
    }
};

const main = async (command, arg1, arg2) => {
    switch (command) {
        case 'start':
            console.log(await start(arg1, arg2));
            break;
        case 'stop':
            console.log(await stop());
            break;
        case 'status':
            console.log(await getCurrent());
            break;
        case 'update':
            console.log(await fetchProjects());
            break;
        default:
            console.log(`no command ${command}`);
    }
}

main(process.argv[2], process.argv[3], process.argv[4]);
