const moment = require('moment');

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

module.exports = {minutesToString, calcDiffMin}
