## Toggl for terminal
When you want to use toggl.com but from your terminal. By convention all my projects start with an uppercase. This small thing was built mainly for my own convenience and might not be super well maintained in the future :)

# Getting started 
- Clone the project
- Run yarn install
- Set up your own values in config.json (api key is found on your accountpage at toggl.com)

# Available commands
- (node toggl.js) start projectName [optionalDescription] //Starts a project with the project name and description
- (node toggl.js) stop //Stop current timer if there is one
- (node toggl.js) status //Prints current timer if there is one 

# Convenient aliases!
alias toggl='node ~/toggl-terminal/toggl.js '
alias tstart='node ~/toggl-terminal/toggl.js start'
alias tstop='node ~/toggl-terminal/toggl.js stop'
alias tstatus='node ~/toggl-terminal/toggl.js status'

