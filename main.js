var test = require('tap').test,
    //fuzzer = require('fuzzer'),
    Random = require('random-js')
    marqdown = require('./marqdown.js'),
    fs = require('fs'),
    //stackTrace = require('stack-trace')
    stackTrace = require('stacktrace-parser')
    ;

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            var array = val.split('');

            do
            {

	            if( fuzzer.random.bool(0.05) )
	            {
	                // REVERSE
	                array = array.reverse();
	            }

	             if( fuzzer.random.bool(0.25) )
	            {
	                // ArraySplice
	                //start = Random.integer(0, array.length);
	                start = Random.integer(0, array.length);
	                deleteCount = Random.integer(0, array.length);

	                array.splice(start, deleteCount);
	            }

	            if( fuzzer.random.bool(0.25) )
	            {
	            	randomStr = new Random.string()(Random.engines.mt19937().seed(0),100);
	            	console.log(randomStr);
	            	randomArray = randomStr.split('');

	            	array.splice.apply(array, [Random.integer(0, array.length), 0].concat(randomArray));
	            }

	         }while( fuzzer.random.bool(0.05) )



            return array.join('');
        }
    }
};

fuzzer.seed(10);

var failedTests = [];
var reducedTests = [];
var passedTests = 0;

function mutationTesting()
{
    var markDown = fs.readFileSync('test.md','utf-8');
    //var markDown = fs.readFileSync('simple.md','utf-8');

    for (var i = 0; i < 1000; i++) {

    	//Alternate between the md files
    	if(i%2 == 0)
    	{
    		markDown = fs.readFileSync('test.md','utf-8');
    	}
    	else
    	{
    		markDown = fs.readFileSync('simple.md','utf-8');
    	}

        var mutuatedString = fuzzer.mutate.string(markDown);

        try
        {
            marqdown.render(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
            reducedTests.push(e.stack);
        }
    }

    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber );
    }

    var setReduced = new Set(reducedTests);


    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, setReduced.size) );
}

mutationTesting();

//test('markedMutation', function(t) {
//
//});


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}