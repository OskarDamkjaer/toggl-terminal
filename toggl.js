const axios = require('axios');
const moment = require('moment');
const promisify = require('util').promisify;
const homedir = require('os').homedir();
const fs = require('fs');
const config = require('./config.json');

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

const getProjects = async () => {
  const resp = await toggl('workspaces/1041293/projects');
  const save = resp.data.map(item => ({name: item.name, pid: item.id}));
  await writeFile(projectPath, JSON.stringify({courses: save}));
};

const findProjectById = async pid => {
  const courses = await readProj();
  return courses.filter(item => item.pid === pid)[0];
};

const readProj = async () => {
  const rawFile = await readFile(projectPath);
  const projects = JSON.parse(rawFile);
  return projects.courses;
};

const getCurrent = async () => {
  const resp = await toggl('time_entries/current');
  const data = resp.data.data;

  if (!data) {
    return 'no timer running';
  }

  let project = await findProjectById(resp.data.data.pid);
  let projectName = 'no Project found';
  if (!project) {
    await getProjects();
    project = await findProjectById(resp.data.data.pid);
  }
  if (project) {
    projectName = project.name;
  }

  const diffMin = calcDiffMin(data.start);
  return (
    projectName + ' (' + data.description + ') for ' + minutesToString(diffMin)
  );
};

const minutesToString = minutes => {
  if (minutes < 60) {
    return minutes + ' minutes.';
  }
  return Math.floor(diffMin / 60) + ' hours and ' + diffMin % 60 + ' minutes.';
};

const calcDiffMin = start => {
  const begin = moment(start);
  const now = moment();
  const diffMin = now.diff(begin, 'minutes');
  return diffMin;
};

const stop = async () => {
  const resp = await toggl('time_entries/current');
  const data = resp.data.data;
  if (!data) {
    return 'no rimer running';
  }
  // Now we must have a project
  const project = await findProjectById(data.pid);

  try {
    await toggl.put('time_entries/' + data.id + '/stop');
    return (
      'stopped ' +
      project.name +
      ' (' +
      data.description +
      '), after ' +
      minutesToString(calcDiffMin(data.start))
    );
  } catch (e) {
    return 'failed to stop: ' + e;
  }
};

const start = async (inProject, inDescript) => {
  if (!inProject) {
    console.log('no project entered');
  }

  await stop();
  const projects = await readProj();
  let projToStart = inProject.charAt(0).toUpperCase() + inProject.slice(1);

  const foundProj = projects.filter(item =>
    item.name.startsWith(projToStart),
  )[0];

  if (!foundProj) {
    return 'no project found matching ' + inProject;
  }
  const foundProjId = foundProj.pid;
  const foundProjName = foundProj.name;

  let desc = inDescript;
  if (!inDescript) {
    desc = '';
  }

  try {
    await toggl.post('/time_entries/start', {
      time_entry: {
        description: desc,
        pid: foundProjId,
        tags: [],
        created_with: 'curl',
      },
    });
    return 'started timer for ' + foundProjName;
  } catch (e) {
    return 'failed to start timer ' + e;
  }
};

const main = async (command, arg1, arg2) => {
  if (command === 'start') {
    return console.log(await start(arg1, arg2));
  }
  if (command === 'stop') {
    return console.log(await stop());
  }
  if (command === 'status') {
    return console.log(await getCurrent());
  }
  if (command === 'current') {
    return console.log(await getCurrent());
  }
  console.log('no command ', command);
};

main(process.argv[2], process.argv[3], process.argv[4]);
