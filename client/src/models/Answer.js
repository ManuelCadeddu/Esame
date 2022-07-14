function Answer({ id, text, winning, riddleId, userId } = {}) {

    this.id = id;
    this.text = text;
    this.winning = winning;
    this.riddleId = riddleId;
    this.userId = userId;
}

export { Answer }