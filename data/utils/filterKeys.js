module.exports = function(hash, allowedKeys) {
  let filtered = {};
  for (let key of allowedKeys) {
    if (key in hash && hash[key] !== undefined) {
      filtered[key] = hash[key];
    }
  }
  return filtered;
};
