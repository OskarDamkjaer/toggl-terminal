# Toggl for terminal

When you want to use the timer from toggl.com but from your terminal. By convention all my projects start with an uppercase. This small thing was built mainly for my own convenience and might not be super well maintained in the future :)

It is a bit light on error handling so use at your own risk.

## Getting started

*   Clone the project
*   Run `yarn`
*   Set up your own values in config.json (api key is found on your accountpage at toggl.com)
*   You could also set export TOGGL_API_KEY if you don't want to put it in config.json

## Available commands

*   (node toggl.js) start projectName [optionalDescription] //Starts a project with the project name and description
*   (node toggl.js) stop //Stop current timer if there is one
*   (node toggl.js) status //Print current timer if there is one
*   (node toggl.js) update //Update the list of projects (should be done automatically)

## Convenient alias!

`alias t='node ~/toggl-terminal/toggl.js '`
This alias enables the quicker syntax `t stop`.
