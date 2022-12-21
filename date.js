
exports.getDate = function() {
    const fullDate = new Date().toLocaleString(
        'en-US', {weekday: "long", day: "numeric", month: "long"}
    );
    return fullDate;
}

exports.getDay = function getDay() {
    const day = new Date().toLocaleString(
        'en-US', {weekday: "long"}
    );
    return day;
}
