const axios = require('axios')
const moment = require('moment')
const fs = require('fs')

const toggl = axios.create({ 
                baseURL: 'https://www.toggl.com/api/v8/',
                auth: {
                    username: 'exampleApiKey',
                    password: 'api_token'
                },
            })

const commands = ['start', 'stop', 'status', 'current', 'projects']



const getProjects = async () => {
    const resp = await toggl('workspaces/1041293/projects')
    const save = resp.data.map(item => ({name: item.name, pid: item.id}))
    fs.        
    console.log(save)
}
getProjects()


const getCurrent = async () => {
    const resp = await toggl('time_entries/current')
    const data = resp.data.data;

    if(!data) {
        console.log('no timer running')
    } else {
        const start = moment(data.start)
        const now = moment()
        const diffMin = now.diff(start, 'minutes')
        console.log(data)
        if(diffMin < 60){
            console.log(data.description, "for", diffMin, "minutes")
        } else {
            console.log(data.description, "for", Math.floor(diffMin / 60), "hours and", diffMin % 60, "minutes")
        }
    }
}

