function override(source1, source2) {
  var target = {};

  for (var key1 in source1) {
    target[key1] = source1[key1];
  }

  for (var key2 in source2) {
    if (key2 in target && typeof source2[key2] == 'object') {
      target[key2] = override(target[key2], source2[key2]);
    } else if (Array.isArray(source2[key2])) {
      target[key2] = source2[key2].slice(0);
    } else {
      target[key2] = source2[key2];
    }
  }

  return target;
}

module.exports = override;
