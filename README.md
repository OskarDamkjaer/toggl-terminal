# Toggl for your terminal

Track your time with [toggl](https://www.toggl.com) right from your terminal! By convention all my projects start with an uppercase. 

I built this mainly for my own convenience so it might have some rough edges :)

## Getting started

*   Clone the project
*   Run `yarn`
*   Set up your own values in config.json (api key is found on your accountpage at toggl.com)
*   You could also set export TOGGL_API_KEY if you don't want to put it in config.json

## Available commands

*   `(node toggl.js) start projectName [optionalDescription]` //Starts a timer with the project name and description 
*   `(node toggl.js) stop` //Stop current timer if there is one
*   `(node toggl.js) status` //Print current timer if there is one
*   `(node toggl.js) update` //Update the list of projects (should be done automatically)

## Convenient alias!

`alias t='node ~/toggl-terminal/toggl.js '`
This alias enables the quicker syntax `t stop`.
