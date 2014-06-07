function momentEqualityMatcher(util, customEqualityMatchers) {
  function format(moment) {
    return "<" + moment.format("dddd, MMMM Do YYYY, h:mm:ss a") + ">";
  }
  
  function compare(actual, expected) {
    var result = {};
    
    if (actual && actual._isAMomentObject
      && expected && expected._isAMomentObject)
    {
      result.pass = actual.isSame(expected);
      if (!result.pass) {
        result.message = "Expected " + format(actual) + " to be " + format(expected);
      }
    } else {
      result.pass = false;
      result.message = "Expected objects to be Moments";
    }
    
    return result;
  }
  
  return {
    compare: compare
  };
}

beforeEach(function() {
  jasmine.addMatchers({
    toBeSameTimeAs: momentEqualityMatcher
  });
});
