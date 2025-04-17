Array.prototype.distinct = function () {
    return this.filter((value, index, array) => array.indexOf(value) === index);
};
export {};
