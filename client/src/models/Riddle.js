const dayjs = require('dayjs');

function Riddle({ id, text, solution, suggestion1, suggestion2, difficulty, duration, dateFirstAnswer, open, userId} = {}) {
    
    this.id = id;
    this.text = text;
    this.solution = solution;
    this.suggestion1 = suggestion1;
    this.suggestion2 = suggestion2;
    this.difficulty = difficulty;
    this.duration = duration;
    this.dateFirstAnswer = dayjs(dateFirstAnswer);
    this.open = open;
    this.userId = userId;
}

export { Riddle }