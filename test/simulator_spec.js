var Simulator = require('../scripts/simulator');
var Randomizer = require('../scripts/randomizer');
var moment = require('moment');

describe ('Simulator', function() {
  var simulator, randomizer;
  
  beforeEach(function() {
    randomizer = new Randomizer();
    simulator = new Simulator(randomizer);    
  });
  
  function stubRandomizerToReturn(values) {
    var index = 0;
    spyOn(randomizer, "get").and.callFake(function() {
      return values[index++];
    });
  }
  
  function stubSimulatorToPlay(results) {
    var index = 0;
    spyOn(simulator, "_playOnce").and.callFake(function() {
      if (index == results.length) {
        index = 0;
      }
      return results[index++];
    });
  }
  
  describe ('#_pickValues', function() {
    it ('returns an empty array when asked to pick 0 values', function() {
      var values = simulator._pickValues([
        { value: 1 }, { value: 2 }, { value: 3 }
      ], 0);
      expect(values).toEqual([]);
    });
    
    it ('returns 2 randomly selected values from the set when asked to pick 2 values', function() {
      stubRandomizerToReturn([2, 0, 1]);
      var values = simulator._pickValues([
        { value: 1 }, { value: 2 }, { value: 3 }
      ], 3);
      expect(values).toEqual([3, 1, 2]);
    });
  });
  
  describe ('#_pickCycleTimeValues', function() {
    it ('picks opts.backlogSize values from cycleTimeData', function() {
      stubRandomizerToReturn([1, 0, 1]);
      var values = simulator._pickCycleTimeValues({
        backlogSize: 3,
        cycleTimeData: [
          { value: 2 }, { value: 3 }
        ]
      });
      expect(values).toEqual([3, 2, 3]);
    });
  });
  
  describe ('#_pickWorkInProgressValues', function() {
    it ('picks ten five at random from workInProgressData', function() {
      stubRandomizerToReturn([1, 0, 2, 1, 0]);
      var values = simulator._pickWorkInProgressValues({
        workInProgressData: [
          { value: 1 }, { value: 2 }, { value: 3 }
        ]
      });
      expect(values).toEqual([2, 1, 3, 2, 1]);
    });
  });
  
  describe ('#_playOnce', function() {
    it ('simulates work once when given one CT datapoint, one WIP datapoint and playCount is 1', function() {
      spyOn(simulator, "_pickCycleTimeValues").and.returnValue([6, 6, 6, 6]);
      spyOn(simulator, "_pickWorkInProgressValues").and.returnValue([3, 3, 3, 3, 3]);

      var simulation = simulator._playOnce({
        backlogSize: 4,
        cycleTimeData: [],
        workInProgressData: []
      });

      expect(simulation).toEqual({
        averageCycleTime: 6,
        averageWorkInProgress: 3,
        totalTime: 24, // averageCycleTime * backlogSize
        actualTime: 8 // totalTime / averageWorkInProgress
      });
    });
  });
  
  describe ('#simulate', function() {
    it ('returns an empty dataset when asked to play 0 times', function() {
      var simulations = simulator.play({
        playCount: 0
      });
      expect(simulations).toEqual([]); 
    });
    
    it ('returns a list of simulations when asked to play k times', function() {
      var expectedResults = [
        { actualTime: 2 },
        { actualTime: 3 }
      ]
      stubSimulatorToPlay(expectedResults);

      var simulations = simulator.play({
        playCount: 2
      });

      expect(simulations).toEqual(expectedResults);
    });
  });
  
  describe ('#forecast', function() {
    it ('plays 100 times and forecasts using the results', function() {
      stubSimulatorToPlay([
        { actualTime: 2 },
        { actualTime: 2 },
        { actualTime: 2 },
        { actualTime: 2 },
        { actualTime: 2 },
        { actualTime: 5 },
        { actualTime: 5 },
        { actualTime: 5 },
        { actualTime: 7 },
        { actualTime: 9 }
      ]);
      var forecast = simulator.forecast({
        backlogSize: 4
      });
      expect(forecast).toEqual([
        { likelihood: 50, actualTime: 2 },
        { likelihood: 80, actualTime: 5 },
        { likelihood: 90, actualTime: 7 }
      ]);      
    });
  });
});
